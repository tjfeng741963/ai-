/**
 * 商业计划书导出服务
 * 支持导出为 HTML/PDF 格式的专业评级报告
 */

import type { RatingResult, GradeLevel } from '@/types/rating.ts';
import type {
  AdvancedRatingResult,
  ExecutiveSummary,
  DetailedAnalysis,
  ActionableRecommendation,
} from '@/types/rating-advanced.ts';
import { GRADE_CONFIG, DIMENSION_LABELS } from '@/types/rating.ts';

/** 导出格式 */
export type ExportFormat = 'html' | 'markdown' | 'pdf';

/** 导出选项 */
export interface ExportOptions {
  format: ExportFormat;
  includeSummary: boolean;
  includeDetailedAnalysis: boolean;
  includeRecommendations: boolean;
  includeCharts: boolean;
  scriptName?: string;
}

/** 获取等级对应的中文标签 */
function getGradeLabel(grade: string): string {
  const labels: Record<string, string> = {
    'S': 'S级（爆款潜力）',
    'A+': 'A+级（高质量剧本）',
    'A': 'A级（优质剧本）',
    'B': 'B级（良好剧本）',
    'C': 'C级（待完善）',
    'D': 'D级（需要大幅修改）',
  };
  return labels[grade] || `${grade}级`;
}

/** 生成 HTML 报告 */
export function generateHTMLReport(
  result: RatingResult,
  advancedResult?: AdvancedRatingResult,
  options: Partial<ExportOptions> = {}
): string {
  const {
    includeSummary = true,
    includeDetailedAnalysis = true,
    includeRecommendations = true,
    scriptName = '未命名剧本',
  } = options;

  const gradeConfig = GRADE_CONFIG[result.overallGrade as GradeLevel];
  const now = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>剧本AI评级报告 - ${scriptName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.8;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header .subtitle { opacity: 0.9; font-size: 14px; }
    .grade-badge {
      display: inline-block;
      font-size: 48px;
      font-weight: 900;
      margin: 20px 0;
      padding: 10px 30px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
    }
    .score { font-size: 24px; opacity: 0.9; }
    .content { padding: 40px; }
    .section { margin-bottom: 40px; }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #333;
      border-left: 4px solid #667eea;
      padding-left: 16px;
      margin-bottom: 20px;
    }
    .summary-box {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .summary-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 8px; }
    .summary-text { color: #555; font-size: 15px; }
    .themes { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .theme-tag {
      display: inline-block;
      padding: 4px 12px;
      background: #667eea;
      color: white;
      border-radius: 20px;
      font-size: 12px;
    }
    .dimension-list { }
    .dimension-item {
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .dimension-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .dimension-name { font-weight: 600; color: #333; }
    .dimension-score {
      font-size: 18px;
      font-weight: 700;
      color: #667eea;
    }
    .dimension-grade {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }
    .grade-s { background: #fef3c7; color: #92400e; }
    .grade-a { background: #e0e7ff; color: #4338ca; }
    .grade-b { background: #dbeafe; color: #1e40af; }
    .grade-c { background: #f3f4f6; color: #374151; }
    .dimension-analysis { color: #555; font-size: 14px; line-height: 1.8; }
    .improvements {
      background: #fffbeb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 12px;
    }
    .improvements-title {
      font-size: 13px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
    }
    .improvements-list {
      list-style: none;
      padding: 0;
    }
    .improvements-list li {
      color: #78350f;
      font-size: 13px;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }
    .improvements-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #f59e0b;
    }
    .recommendation {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .recommendation-number {
      width: 32px;
      height: 32px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }
    .recommendation-content h4 { color: #333; margin-bottom: 8px; }
    .recommendation-content p { color: #555; font-size: 14px; }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f8fafc;
      color: #999;
      font-size: 12px;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AI智能诊断｜商业适配度·结构风险·变现潜力</h1>
      <div class="subtitle">剧本名称：${scriptName} | 生成日期：${now}</div>
      <div class="grade-badge">${result.overallGrade}</div>
      <div class="score">总体潜力评分：${result.overallScore.toFixed(0)}/100（${gradeConfig.label}）</div>
    </div>

    <div class="content">
`;

  // 执行摘要
  if (includeSummary && advancedResult?.executiveSummary) {
    const summary = advancedResult.executiveSummary;
    html += `
      <div class="section">
        <h2 class="section-title">I. 执行摘要</h2>
        <div class="summary-box">
          <div class="summary-title">${summary.oneSentence}</div>
          <div class="themes">
            <span class="theme-tag">${summary.genre}</span>
            ${summary.themes.map(t => `<span class="theme-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">剧情主线</h4>
          <p class="summary-text">${summary.plotSummary}</p>
        </div>
        <div>
          <h4 style="color: #333; margin-bottom: 8px;">核心结论</h4>
          <p class="summary-text">${summary.coreConclusion}</p>
        </div>
      </div>
    `;
  } else {
    // 没有高级摘要时使用基础摘要
    html += `
      <div class="section">
        <h2 class="section-title">I. 执行摘要</h2>
        <div class="summary-box">
          <div class="summary-title">${result.summary.oneSentence}</div>
          <p class="summary-text" style="margin-top: 12px;">${result.summary.paragraph}</p>
        </div>
      </div>
    `;
  }

  // 详细分析
  if (includeDetailedAnalysis && advancedResult?.detailedAnalysis) {
    const da = advancedResult.detailedAnalysis;

    // 市场共鸣
    html += `
      <div class="section">
        <h2 class="section-title">II. 详细分析</h2>

        <h3 style="color: #555; font-size: 16px; margin: 20px 0 16px;">A. 市场共鸣与竞争定位</h3>
        <div class="dimension-list">
          ${renderDimensionItem('目标受众定位', da.marketResonance.targetAudience)}
          ${renderDimensionItem('原创性评分', da.marketResonance.originality)}
          ${renderDimensionItem('当下热播契合度', da.marketResonance.trendAlignment)}
        </div>

        <h3 style="color: #555; font-size: 16px; margin: 20px 0 16px;">B. 叙事与剧本基因</h3>
        <div class="dimension-list">
          ${renderDimensionItem('叙事逻辑', da.narrativeDNA.narrativeLogic)}
          ${renderDimensionItem('钩子强度', da.narrativeDNA.hookStrength)}
          ${renderDimensionItem('爽点设计', da.narrativeDNA.pleasureDesign)}
          ${renderDimensionItem('节奏与结构', da.narrativeDNA.pacingStructure)}
          ${renderDimensionItem('主线连贯性', da.narrativeDNA.plotCoherence)}
          ${renderDimensionItem('人物塑造', da.narrativeDNA.characterization)}
          ${renderDimensionItem('对白质量', da.narrativeDNA.dialogueQuality)}
          ${renderDimensionItem('悬念有效性', da.narrativeDNA.suspenseEffectiveness)}
        </div>

        <h3 style="color: #555; font-size: 16px; margin: 20px 0 16px;">C. 商业化潜力</h3>
        <div class="dimension-list">
          ${renderDimensionItem('用户粘性', da.commercialPotential.userStickiness)}
          ${renderDimensionItem('传播潜力', da.commercialPotential.viralPotential)}
        </div>

        <h3 style="color: #555; font-size: 16px; margin: 20px 0 16px;">D. 合规性评估</h3>
        <div class="dimension-list">
          ${renderDimensionItem('内容合规性', da.complianceAssessment.contentCompliance)}
          ${renderDimensionItem('价值观导向', da.complianceAssessment.valueOrientation)}
        </div>
      </div>
    `;
  } else {
    // 使用基础维度分析
    html += `
      <div class="section">
        <h2 class="section-title">II. 维度分析</h2>
        <div class="dimension-list">
    `;
    for (const [key, dim] of Object.entries(result.dimensions)) {
      const label = DIMENSION_LABELS[key] || key;
      html += `
          <div class="dimension-item">
            <div class="dimension-header">
              <span class="dimension-name">${label}</span>
              <span class="dimension-score">${dim.score.toFixed(1)}/10</span>
            </div>
            <p class="dimension-analysis">${dim.analysis}</p>
            ${dim.suggestions && dim.suggestions.length > 0 ? `
              <div class="improvements">
                <div class="improvements-title">建议</div>
                <ul class="improvements-list">
                  ${dim.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
      `;
    }
    html += `
        </div>
      </div>
    `;
  }

  // 可操作建议
  if (includeRecommendations && advancedResult?.actionableRecommendations?.length) {
    html += `
      <div class="section">
        <h2 class="section-title">III. 综合可操作建议</h2>
        ${advancedResult.actionableRecommendations.map(rec => `
          <div class="recommendation">
            <div class="recommendation-number">${rec.priority}</div>
            <div class="recommendation-content">
              <h4>${rec.title}</h4>
              <p>${rec.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    // 使用基础改进建议
    html += `
      <div class="section">
        <h2 class="section-title">III. 改进建议</h2>
        ${result.improvements.critical.length > 0 ? `
          <h4 style="color: #dc2626; margin-bottom: 12px;">必须修改</h4>
          <ul style="margin-bottom: 20px; padding-left: 20px;">
            ${result.improvements.critical.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
          </ul>
        ` : ''}
        ${result.improvements.important.length > 0 ? `
          <h4 style="color: #f59e0b; margin-bottom: 12px;">建议修改</h4>
          <ul style="padding-left: 20px;">
            ${result.improvements.important.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
  }

  // 商业闭环方案
  const businessLoop = advancedResult?.finalSummary?.businessClosedLoop;
  if (businessLoop) {
    html += `
      <div class="section">
        <h2 class="section-title">IV. 商业化闭环方案</h2>
        <div class="summary-box">
          <div class="summary-title">目标定位</div>
          <p class="summary-text">${businessLoop.targetPositioning}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">变现路径</h4>
          <ul style="padding-left: 20px; color: #555;">
            ${businessLoop.monetizationPath.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">上线节奏</h4>
          <ul style="padding-left: 20px; color: #555;">
            ${businessLoop.launchPlan.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">核心KPI看板</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="border: 1px solid #e5e7eb; text-align: left; padding: 8px;">指标</th>
                <th style="border: 1px solid #e5e7eb; text-align: left; padding: 8px;">目标</th>
                <th style="border: 1px solid #e5e7eb; text-align: left; padding: 8px;">周期</th>
                <th style="border: 1px solid #e5e7eb; text-align: left; padding: 8px;">负责人</th>
              </tr>
            </thead>
            <tbody>
              ${businessLoop.kpiDashboard.map((kpi) => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${kpi.metric}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${kpi.target}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${kpi.window}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${kpi.owner ?? '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">验证实验</h4>
          <ul style="padding-left: 20px; color: #555;">
            ${businessLoop.validationExperiments.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">风险与兜底</h4>
          <ul style="padding-left: 20px; color: #555;">
            ${businessLoop.riskMitigation.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>

        <div class="summary-box">
          <div class="summary-title">下一季度目标</div>
          <p class="summary-text">${businessLoop.nextQuarterGoal}</p>
        </div>
      </div>
    `;
  }

  html += `
    </div>

    <div class="footer">
      <p>本报告由 AI 剧本评级系统自动生成</p>
      <p>评估仅供参考，不构成投资建议</p>
    </div>
  </div>
</body>
</html>
`;

  return html;
}

/** 渲染单个维度分析项 */
function renderDimensionItem(
  name: string,
  data: { score: number; grade: string; analysis: string; improvements: string[] }
): string {
  const gradeClass = data.grade.startsWith('S') ? 'grade-s' :
                     data.grade.startsWith('A') ? 'grade-a' :
                     data.grade.startsWith('B') ? 'grade-b' : 'grade-c';

  return `
    <div class="dimension-item">
      <div class="dimension-header">
        <span class="dimension-name">${name}</span>
        <span>
          <span class="dimension-score">${data.score}/100</span>
          <span class="dimension-grade ${gradeClass}">${data.grade}级</span>
        </span>
      </div>
      <p class="dimension-analysis">${data.analysis}</p>
      ${data.improvements && data.improvements.length > 0 ? `
        <div class="improvements">
          <div class="improvements-title">可打磨点</div>
          <ul class="improvements-list">
            ${data.improvements.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

/** 生成 Markdown 报告 */
export function generateMarkdownReport(
  result: RatingResult,
  advancedResult?: AdvancedRatingResult,
  options: Partial<ExportOptions> = {}
): string {
  const {
    includeSummary = true,
    includeDetailedAnalysis = true,
    includeRecommendations = true,
    scriptName = '未命名剧本',
  } = options;

  const gradeConfig = GRADE_CONFIG[result.overallGrade as GradeLevel];
  const now = new Date().toLocaleDateString('zh-CN');

  let md = `# AI智能诊断｜商业适配度·结构风险·变现潜力

**剧本名称：** ${scriptName}
**生成日期：** ${now}

---

## 总体潜力评分：${result.overallScore.toFixed(0)}/100（${result.overallGrade}级）

**评级：** ${gradeConfig.label}

`;

  // 执行摘要
  if (includeSummary && advancedResult?.executiveSummary) {
    const summary = advancedResult.executiveSummary;
    md += `## I. 执行摘要

**频类：** ${summary.genre}
**题材：** ${summary.themes.join('、')}
**一句话介绍：** ${summary.oneSentence}

### 剧情主线
${summary.plotSummary}

### 核心结论
${summary.coreConclusion}

`;
  } else {
    md += `## I. 执行摘要

**一句话总评：** ${result.summary.oneSentence}

${result.summary.paragraph}

`;
  }

  // 详细分析
  if (includeDetailedAnalysis && advancedResult?.detailedAnalysis) {
    const da = advancedResult.detailedAnalysis;

    md += `## II. 详细分析

### A. 市场共鸣与竞争定位

${renderMarkdownDimension('目标受众定位', da.marketResonance.targetAudience)}
${renderMarkdownDimension('原创性评分', da.marketResonance.originality)}
${renderMarkdownDimension('当下热播契合度', da.marketResonance.trendAlignment)}

### B. 叙事与剧本基因

${renderMarkdownDimension('叙事逻辑', da.narrativeDNA.narrativeLogic)}
${renderMarkdownDimension('钩子强度', da.narrativeDNA.hookStrength)}
${renderMarkdownDimension('爽点设计', da.narrativeDNA.pleasureDesign)}
${renderMarkdownDimension('节奏与结构', da.narrativeDNA.pacingStructure)}
${renderMarkdownDimension('主线连贯性', da.narrativeDNA.plotCoherence)}
${renderMarkdownDimension('人物塑造', da.narrativeDNA.characterization)}
${renderMarkdownDimension('对白质量', da.narrativeDNA.dialogueQuality)}
${renderMarkdownDimension('悬念有效性', da.narrativeDNA.suspenseEffectiveness)}

### C. 商业化潜力

${renderMarkdownDimension('用户粘性', da.commercialPotential.userStickiness)}
${renderMarkdownDimension('传播潜力', da.commercialPotential.viralPotential)}

### D. 合规性评估

${renderMarkdownDimension('内容合规性', da.complianceAssessment.contentCompliance)}
${renderMarkdownDimension('价值观导向', da.complianceAssessment.valueOrientation)}

`;
  }

  // 可操作建议
  if (includeRecommendations && advancedResult?.actionableRecommendations?.length) {
    md += `## III. 综合可操作建议

`;
    advancedResult.actionableRecommendations.forEach(rec => {
      md += `**${rec.priority}. ${rec.title}**

${rec.description}

`;
    });
  }

  const businessLoop = advancedResult?.finalSummary?.businessClosedLoop;
  if (businessLoop) {
    md += `## IV. 商业化闭环方案

### 目标定位
${businessLoop.targetPositioning}

### 变现路径
${businessLoop.monetizationPath.map((item) => `- ${item}`).join('\n')}

### 上线节奏
${businessLoop.launchPlan.map((item) => `- ${item}`).join('\n')}

### 核心KPI看板
${businessLoop.kpiDashboard.map((kpi) => `- ${kpi.metric}｜目标：${kpi.target}｜周期：${kpi.window}${kpi.owner ? `｜负责人：${kpi.owner}` : ''}`).join('\n')}

### 验证实验
${businessLoop.validationExperiments.map((item) => `- ${item}`).join('\n')}

### 风险与兜底
${businessLoop.riskMitigation.map((item) => `- ${item}`).join('\n')}

### 下一季度目标
${businessLoop.nextQuarterGoal}

`;
  }

  md += `---

*本报告由 AI 剧本评级系统自动生成，评估仅供参考，不构成投资建议。*
`;

  return md;
}

/** 渲染 Markdown 维度分析 */
function renderMarkdownDimension(
  name: string,
  data: { score: number; grade: string; analysis: string; improvements: string[] }
): string {
  let md = `#### ${name}
**评分：** ${data.score}/100（${data.grade}级）

${data.analysis}

`;

  if (data.improvements && data.improvements.length > 0) {
    md += `**可打磨点：**
${data.improvements.map(item => `- ${item}`).join('\n')}

`;
  }

  return md;
}

/** 下载文件 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** 导出 PDF（通过浏览器打印流程） */
export function exportPDFReport(html: string, title = '剧本评级报告'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('浏览器阻止了弹窗，请允许弹窗后重试导出 PDF');
  }

  printWindow.document.write(html);
  printWindow.document.title = title;
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

/** 导出评级报告 */
export function exportRatingReport(
  result: RatingResult,
  advancedResult?: AdvancedRatingResult,
  options: Partial<ExportOptions> = {}
): void {
  const format = options.format || 'html';
  const scriptName = options.scriptName || '剧本评级报告';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${scriptName}_${timestamp}`;

  if (format === 'html') {
    const html = generateHTMLReport(result, advancedResult, options);
    downloadFile(html, `${filename}.html`, 'text/html;charset=utf-8');
  } else if (format === 'pdf') {
    const html = generateHTMLReport(result, advancedResult, options);
    exportPDFReport(html, filename);
  } else if (format === 'markdown') {
    const md = generateMarkdownReport(result, advancedResult, options);
    downloadFile(md, `${filename}.md`, 'text/markdown;charset=utf-8');
  }
}

/** 打印报告 */
export function printReport(
  result: RatingResult,
  advancedResult?: AdvancedRatingResult,
  options: Partial<ExportOptions> = {}
): void {
  const html = generateHTMLReport(result, advancedResult, options);
  exportPDFReport(html, options.scriptName || '剧本评级报告');
}
