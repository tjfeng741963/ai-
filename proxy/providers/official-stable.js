/**
 * 官方稳定渠道 - 直接调用腾讯云 VOD AIGC API
 *
 * 绕过 scwh 后端认证，直接使用腾讯云 SDK 完成：
 * 1. 图片上传（VOD ApplyUpload → COS → CommitUpload）
 * 2. 生图任务（CreateAigcImageTask）
 * 3. 任务查询（DescribeTaskDetail）
 *
 * 参考：aigc-storyboard-backend/providers/official-stable.js
 */

import COS from 'cos-nodejs-sdk-v5';

const LOG_PREFIX = '[OfficialStable]';

/** 模型 ID → 腾讯云 ModelName / ModelVersion 映射 */
const IMAGE_MODEL_MAPPINGS = {
  'nanobanana-pro': {
    modelName: 'GEM',
    modelVersion: '3.0',
    qualityField: 'quality', // params.quality → OutputConfig.Resolution
  },
  'nanobanana-2': {
    modelName: 'GEM',
    modelVersion: '3.1',
    qualityField: 'quality',
  },
  'doubao-seedream-5.0': {
    modelName: 'Seedream',
    modelVersion: '5.0-lite',
    qualityField: 'quality',
  },
  'doubao-seedream-4.5': {
    modelName: 'Seedream',
    modelVersion: '4.5',
    qualityField: 'quality',
  },
  'hunyuan-image-3.0': {
    modelName: 'Hunyuan',
    modelVersion: '3.0',
    qualityField: 'quality',
  },
};

export class OfficialStableProvider {
  constructor() {
    this.secretId = process.env.OFFICIAL_STABLE_SECRET_ID || '';
    this.secretKey = process.env.OFFICIAL_STABLE_SECRET_KEY || '';
    this.subAppId = parseInt(process.env.OFFICIAL_STABLE_SUB_APP_ID) || 0;
    this.region = process.env.OFFICIAL_STABLE_REGION || 'ap-guangzhou';
    this._client = null;
  }

  /** 检查是否已配置密钥 */
  isConfigured() {
    return !!(this.secretId && this.secretKey);
  }

  /**
   * 上传图片到腾讯云 VOD 存储
   * 流程：ApplyUpload → COS 上传 → CommitUpload → 返回公网 URL
   *
   * @param {Buffer} buffer - 图片二进制数据
   * @param {string} mimetype - MIME 类型 (如 image/png)
   * @param {string} filename - 原始文件名
   * @returns {Promise<string>} 公网可访问的图片 URL
   */
  async uploadImage(buffer, mimetype, filename) {
    const client = await this._getClientAsync();

    // 从文件名提取扩展名
    const ext = filename.split('.').pop() || 'png';

    console.log(`${LOG_PREFIX} 申请上传: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);

    // Step 1: ApplyUpload — 获取 COS 临时凭证和上传路径
    const applyResult = await client.ApplyUpload({
      SubAppId: this.subAppId,
      MediaType: ext,
      MediaName: `outpaint-ref-${Date.now()}`,
    });

    const {
      StorageBucket: bucket,
      StorageRegion: region,
      MediaStoragePath: key,
      TempCertificate: tempCert,
      VodSessionKey: sessionKey,
    } = applyResult;

    console.log(`${LOG_PREFIX} ApplyUpload 成功: bucket=${bucket}, region=${region}, key=${key}`);

    // Step 2: 使用临时凭证上传到 COS
    const cos = new COS({
      SecretId: tempCert.SecretId,
      SecretKey: tempCert.SecretKey,
      SecurityToken: tempCert.Token,
    });

    await new Promise((resolve, reject) => {
      cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });

    console.log(`${LOG_PREFIX} COS 上传完成`);

    // Step 3: CommitUpload — 确认上传完成，获取公网 URL
    const commitResult = await client.CommitUpload({
      SubAppId: this.subAppId,
      VodSessionKey: sessionKey,
    });

    let fileUrl = commitResult.MediaUrl || commitResult.FileUrl || '';

    // 确保 HTTPS
    if (fileUrl.startsWith('http://')) {
      fileUrl = fileUrl.replace('http://', 'https://');
    }

    console.log(`${LOG_PREFIX} CommitUpload 成功: ${fileUrl.substring(0, 100)}...`);
    return fileUrl;
  }

  /**
   * 提交生图任务
   *
   * @param {object} params
   * @param {string} params.model - 模型 ID (如 nanobanana-pro)
   * @param {string} params.prompt - 提示词
   * @param {string[]} params.referenceImages - 参考图 URL 列表
   * @param {string} params.aspectRatio - 宽高比 (如 16:9)
   * @param {string} params.quality - 画质 (如 2K, 4K)
   * @returns {Promise<{taskId: string, status: string}>}
   */
  async generateImage(params) {
    const { model, prompt, referenceImages = [], aspectRatio, quality } = params;

    const mapping = IMAGE_MODEL_MAPPINGS[model];
    if (!mapping) {
      throw new Error(`官方稳定渠道不支持该模型: ${model}`);
    }

    const client = await this._getClientAsync();

    // 构建 OutputConfig
    const outputConfig = {
      StorageMode: 'Temporary',
      PersonGeneration: 'AllowAdult',
    };
    if (aspectRatio) outputConfig.AspectRatio = aspectRatio;
    if (quality) outputConfig.Resolution = quality;

    // 构建请求参数
    const requestParams = {
      SubAppId: this.subAppId,
      ModelName: mapping.modelName,
      ModelVersion: mapping.modelVersion,
      OutputConfig: outputConfig,
    };

    if (prompt) {
      requestParams.Prompt = prompt;
    }

    // 参考图 → FileInfos
    if (referenceImages.length > 0) {
      requestParams.FileInfos = referenceImages.map((url) => ({
        Type: 'Url',
        Url: url,
      }));
    }

    console.log(
      `${LOG_PREFIX} CreateAigcImageTask: ${mapping.modelName} ${mapping.modelVersion}, ` +
        `ratio=${aspectRatio}, quality=${quality}, refs=${referenceImages.length}`,
    );

    try {
      const response = await client.CreateAigcImageTask(requestParams);

      const taskId = response.TaskId;
      if (!taskId) {
        console.error(`${LOG_PREFIX} 未返回 TaskId:`, response);
        return { taskId: null, status: 'failed', error: '未返回任务 ID' };
      }

      console.log(`${LOG_PREFIX} 图片任务创建成功: ${taskId}`);
      return {
        taskId: `official-stable:image:${taskId}`,
        status: 'processing',
      };
    } catch (error) {
      console.error(`${LOG_PREFIX} CreateAigcImageTask 失败:`, error.message);
      return { taskId: null, status: 'failed', error: error.message };
    }
  }

  /**
   * 查询图片任务状态
   *
   * @param {string} taskId - 带前缀的任务 ID (official-stable:image:xxx)
   * @returns {Promise<{status: string, progress: number, imageUrl?: string, error?: string}>}
   */
  async queryImageTask(taskId) {
    // 移除前缀
    const realTaskId = taskId.replace('official-stable:image:', '');

    const client = await this._getClientAsync();

    try {
      const response = await client.DescribeTaskDetail({
        TaskId: realTaskId,
        SubAppId: this.subAppId,
      });

      const task = response.AigcImageTask;
      if (!task) {
        // 可能在 WAITING 状态
        if (response.Status === 'WAITING' || response.Status === 'PROCESSING') {
          return { status: 'processing', progress: 10 };
        }
        return { status: 'processing', progress: 0 };
      }

      // 状态映射：FINISH + ErrCode=0 → completed
      if (task.Status === 'FINISH') {
        if (task.ErrCode === 0) {
          let imageUrl = task.Output?.FileInfos?.[0]?.FileUrl || null;
          if (imageUrl && imageUrl.startsWith('http://')) {
            imageUrl = imageUrl.replace('http://', 'https://');
          }
          console.log(`${LOG_PREFIX} 图片完成: ${imageUrl?.substring(0, 100)}...`);
          return { status: 'completed', progress: 100, imageUrl };
        }
        console.error(`${LOG_PREFIX} 任务失败: ErrCode=${task.ErrCode}, Message=${task.Message}`);
        return { status: 'failed', progress: 0, error: task.Message || `ErrCode: ${task.ErrCode}` };
      }

      // PROCESSING / WAITING
      return { status: 'processing', progress: task.Progress || 10 };
    } catch (error) {
      console.error(`${LOG_PREFIX} DescribeTaskDetail 失败:`, error.message);
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * 异步获取 Client（兼容 ESM dynamic import）
   */
  async _getClientAsync() {
    if (this._client) return this._client;

    const vodModule = await import('tencentcloud-sdk-nodejs-vod');
    const { Client } = vodModule.vod.v20180717;

    this._client = new Client({
      credential: {
        secretId: this.secretId,
        secretKey: this.secretKey,
      },
      region: this.region,
      profile: {
        httpProfile: { reqTimeout: 300 },
      },
    });
    return this._client;
  }
}
