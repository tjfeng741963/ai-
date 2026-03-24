/**
 * 商业计划书导出服务
 * 支持导出为 HTML/PDF 格式的专业评级报告
 */

import type { RatingResult, GradeLevel } from '../types/rating';
import type {
  AdvancedRatingResult,
  ExecutiveSummary,
  DetailedAnalysis,
  DimensionDetailedAnalysis,
  ActionableRecommendation,
} from '../types/rating-advanced';
import { GRADE_CONFIG, DIMENSION_LABELS } from '../types/rating';
import { getLabels, getGradeLabelByLang, getDimensionLabel, type OutputLanguage } from './i18n-labels.ts';

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
  language?: OutputLanguage;
}

/** 获取等级对应的标签 */
function getGradeLabel(grade: string, lang: OutputLanguage = 'zh'): string {
  return getGradeLabelByLang(grade, lang);
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
    language = 'zh',
  } = options;

  // 标签始终使用中文（客户群体为华人），language参数仅标识台词语言
  const lang: OutputLanguage = 'zh';
  const L = getLabels(lang);
  const gradeConfig = GRADE_CONFIG[result.overallGrade as GradeLevel];
  const now = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${L.reportSubtitle} - ${scriptName}</title>
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
    .key-findings {
      background: #eff6ff;
      border-radius: 8px;
      padding: 16px;
      margin-top: 12px;
    }
    .key-findings-title {
      font-size: 13px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .key-findings-list {
      list-style: none;
      padding: 0;
    }
    .key-findings-list li {
      color: #1e3a5f;
      font-size: 13px;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }
    .key-findings-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #3b82f6;
    }
    .evidence-section {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 12px;
    }
    .evidence-title {
      font-size: 13px;
      font-weight: 600;
      color: #4b5563;
      margin-bottom: 8px;
    }
    .evidence-list {
      list-style: none;
      padding: 0;
    }
    .evidence-list li {
      color: #6b7280;
      font-size: 13px;
      font-style: italic;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }
    .evidence-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #9ca3af;
    }
    .strengths {
      background: #f0fdf4;
      border-radius: 8px;
      padding: 16px;
      margin-top: 12px;
    }
    .strengths-title {
      font-size: 13px;
      font-weight: 600;
      color: #166534;
      margin-bottom: 8px;
    }
    .strengths-list {
      list-style: none;
      padding: 0;
    }
    .strengths-list li {
      color: #14532d;
      font-size: 13px;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }
    .strengths-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #22c55e;
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
      <h1>${L.reportTitle}</h1>
      <div class="subtitle">${L.scriptLabel}：${scriptName} | ${L.dateLabel}：${now}</div>
      <div class="grade-badge">${result.overallGrade}</div>
      <div class="score">${L.overallScoreLabel}：${result.overallScore.toFixed(0)}/100（${getGradeLabel(result.overallGrade, lang)}）</div>
    </div>

    <div class="content">
`;

  // 执行摘要
  if (includeSummary && advancedResult?.executiveSummary) {
    const summary = advancedResult.executiveSummary;
    html += `
      <div class="section">
        <h2 class="section-title">${L.executiveSummary}</h2>
        <div class="summary-box">
          <div class="summary-title">${summary.oneSentence}</div>
          <div class="themes">
            <span class="theme-tag">${summary.genre}</span>
            ${summary.subGenre ? `<span class="theme-tag">${summary.subGenre}</span>` : ''}
            ${summary.themes.map(t => `<span class="theme-tag">${t}</span>`).join('')}
            ${(summary.platformTags ?? []).map(t => `<span class="theme-tag" style="background:#dcfce7;color:#15803d;">#${t}</span>`).join('')}
            ${(summary.overseasTags ?? []).map(t => `<span class="theme-tag" style="background:#ffedd5;color:#c2410c;">${t}</span>`).join('')}
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">${L.plotSummaryLabel}</h4>
          <p class="summary-text">${summary.plotSummary}</p>
        </div>
        <div>
          <h4 style="color: #333; margin-bottom: 8px;">${L.coreConclusion}</h4>
          <p class="summary-text">${summary.coreConclusion}</p>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="section">
        <h2 class="section-title">${L.executiveSummary}</h2>
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
        <h2 class="section-title">${L.detailedAnalysis}</h2>

        <h3 style="color: #555; font-size: 16px; margin: 20px 0 16px;">${L.sectionA}</h3>
        <p style="color: #888; font-size: 13px; margin: -12px 0 16px;">${L.sectionASubtitle}</p>
        <div class="dimension-list">
          ${renderDimensionItem(getDimensionLabel('targetAudience', lang), da.marketResonance.targetAudience, lang)}
          ${renderDimensionItem(getDimensionLabel('originality', lang), da.marketResonance.originality, lang)}
          ${renderDimensionItem(getDimensionLabel('trendAlignment', lang), da.marketResonance.trendAlignment, lang)}
        </div>

        <h3 style="color: #555; font-size: 16px; margin: 20px 0 16px;">${L.sectionB}</h3>
        <p style="color: #888; font-size: 13px; margin: -12px 0 16px;">${L.sectionBSubtitle}</p>
        <div class="dimension-list">
          ${renderDimensionItem(getDimensionLabel('narrativeLogic', lang), da.narrativeDNA.narrativeLogic, lang)}
          ${renderDimensionItem(getDimensionLabel('hookStrength', lang), da.narrativeDNA.hookStrength, lang)}
          ${renderDimensionItem(getDimensionLabel('pleasureDesign', lang), da.narrativeDNA.pleasureDesign, lang)}
          ${renderDimensionItem(getDimensionLabel('pacingStructure', lang), da.narrativeDNA.pacingStructure, lang)}
          ${renderDimensionItem(getDimensionLabel('plotCoherence', lang), da.narrativeDNA.plotCoherence, lang)}
          ${renderDimensionItem(getDimensionLabel('characterization', lang), da.narrativeDNA.characterization, lang)}
          ${renderDimensionItem(getDimensionLabel('dialogueQuality', lang), da.narrativeDNA.dialogueQuality, lang)}
          ${renderDimensionItem(getDimensionLabel('suspenseEffectiveness', lang), da.narrativeDNA.suspenseEffectiveness, lang)}
        </div>

        <h3 style="color: #555; font-size: 16px; margin: 20px 0 16px;">${L.sectionC}</h3>
        <p style="color: #888; font-size: 13px; margin: -12px 0 16px;">${L.sectionCSubtitle}</p>
        <div class="dimension-list">
          ${renderDimensionItem(getDimensionLabel('userStickiness', lang), da.commercialPotential.userStickiness, lang)}
          ${renderDimensionItem(getDimensionLabel('viralPotential', lang), da.commercialPotential.viralPotential, lang)}
        </div>

        <h3 style="color: #555; font-size: 16px; margin: 20px 0 16px;">${L.sectionD}</h3>
        <p style="color: #888; font-size: 13px; margin: -12px 0 16px;">${L.sectionDSubtitle}</p>
        <div class="dimension-list">
          ${renderDimensionItem(getDimensionLabel('contentCompliance', lang), da.complianceAssessment.contentCompliance, lang)}
          ${renderDimensionItem(getDimensionLabel('valueOrientation', lang), da.complianceAssessment.valueOrientation, lang)}
        </div>
      </div>
    `;
  } else {
    // 使用基础维度分析
    html += `
      <div class="section">
        <h2 class="section-title">${L.basicDimensions}</h2>
        <div class="dimension-list">
    `;
    for (const [key, dim] of Object.entries(result.dimensions)) {
      const label = getDimensionLabel(key, lang) || DIMENSION_LABELS[key] || key;
      html += `
          <div class="dimension-item">
            <div class="dimension-header">
              <span class="dimension-name">${label}</span>
              <span class="dimension-score">${dim.score.toFixed(1)}/10</span>
            </div>
            <p class="dimension-analysis">${dim.analysis}</p>
            ${dim.suggestions && dim.suggestions.length > 0 ? `
              <div class="improvements">
                <div class="improvements-title">${L.suggestions}</div>
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
        <h2 class="section-title">${L.actionableRecommendations}</h2>
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
    html += `
      <div class="section">
        <h2 class="section-title">${L.improvementSection}</h2>
        ${result.improvements.critical.length > 0 ? `
          <h4 style="color: #dc2626; margin-bottom: 12px;">${L.criticalChanges}</h4>
          <ul style="margin-bottom: 20px; padding-left: 20px;">
            ${result.improvements.critical.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
          </ul>
        ` : ''}
        ${result.improvements.important.length > 0 ? `
          <h4 style="color: #f59e0b; margin-bottom: 12px;">${L.suggestedChanges}</h4>
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
        <h2 class="section-title">${L.businessClosedLoop}</h2>
        <div class="summary-box">
          <div class="summary-title">${L.targetPositioning}</div>
          <p class="summary-text">${businessLoop.targetPositioning}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">${L.monetizationPath}</h4>
          <ul style="padding-left: 20px; color: #555;">
            ${businessLoop.monetizationPath.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">${L.launchPlan}</h4>
          <ul style="padding-left: 20px; color: #555;">
            ${businessLoop.launchPlan.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">${L.kpiDashboard}</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="border: 1px solid #e5e7eb; text-align: left; padding: 8px;">${L.kpiMetric}</th>
                <th style="border: 1px solid #e5e7eb; text-align: left; padding: 8px;">${L.kpiTarget}</th>
                <th style="border: 1px solid #e5e7eb; text-align: left; padding: 8px;">${L.kpiWindow}</th>
                <th style="border: 1px solid #e5e7eb; text-align: left; padding: 8px;">${L.kpiOwner}</th>
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
          <h4 style="color: #333; margin-bottom: 8px;">${L.validationExperiments}</h4>
          <ul style="padding-left: 20px; color: #555;">
            ${businessLoop.validationExperiments.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 8px;">${L.riskMitigation}</h4>
          <ul style="padding-left: 20px; color: #555;">
            ${businessLoop.riskMitigation.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>

        <div class="summary-box">
          <div class="summary-title">${L.nextQuarterGoal}</div>
          <p class="summary-text">${businessLoop.nextQuarterGoal}</p>
        </div>
      </div>
    `;
  }

  html += `
    </div>

    <div class="footer">
      <p>${L.footerLine1}</p>
      <p>${L.footerLine2}</p>
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
  data: DimensionDetailedAnalysis,
  lang: OutputLanguage = 'zh'
): string {
  const L = getLabels(lang);
  const gradeClass = data.grade.startsWith('S') ? 'grade-s' :
                     data.grade.startsWith('A') ? 'grade-a' :
                     data.grade.startsWith('B') ? 'grade-b' : 'grade-c';
  const gradeText = lang === 'en' ? data.grade : `${data.grade}${L.gradeUnit}`;

  return `
    <div class="dimension-item">
      <div class="dimension-header">
        <span class="dimension-name">${name}</span>
        <span>
          <span class="dimension-score">${data.score}/100</span>
          <span class="dimension-grade ${gradeClass}">${gradeText}</span>
        </span>
      </div>
      <p class="dimension-analysis">${data.analysis || L.noAnalysis}</p>
      ${data.keyFindings && data.keyFindings.length > 0 ? `
        <div class="key-findings">
          <div class="key-findings-title">${L.keyFindingsTitle}</div>
          <ul class="key-findings-list">
            ${data.keyFindings.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${data.evidence && data.evidence.length > 0 ? `
        <div class="evidence-section">
          <div class="evidence-title">${L.evidenceTitle}</div>
          <ul class="evidence-list">
            ${data.evidence.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${data.strengths && data.strengths.length > 0 ? `
        <div class="strengths">
          <div class="strengths-title">${L.strengthsTitle}</div>
          <ul class="strengths-list">
            ${data.strengths.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${data.improvements && data.improvements.length > 0 ? `
        <div class="improvements">
          <div class="improvements-title">${L.improvementsTitle}</div>
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
    language = 'zh',
  } = options;

  // 标签始终使用中文
  const lang: OutputLanguage = 'zh';
  const L = getLabels(lang);
  const gradeConfig = GRADE_CONFIG[result.overallGrade as GradeLevel];
  const now = new Date().toLocaleDateString('zh-CN');

  let md = `# ${L.reportTitle}

**${L.scriptLabel}:** ${scriptName}
**${L.dateLabel}:** ${now}

---

## ${L.overallScoreLabel}: ${result.overallScore.toFixed(0)}/100 (${getGradeLabel(result.overallGrade, lang)})

`;

  // 执行摘要
  if (includeSummary && advancedResult?.executiveSummary) {
    const summary = advancedResult.executiveSummary;
    const themeSep = '、';
    md += `## ${L.executiveSummary}

**${L.genreLabel}:** ${summary.genre}${summary.subGenre ? ` · ${summary.subGenre}` : ''}
**${L.themesLabel}:** ${summary.themes.join(themeSep)}
${summary.platformTags?.length ? `**平台标签:** ${summary.platformTags.map(t => `#${t}`).join(themeSep)}\n` : ''}${summary.overseasTags?.length ? `**出海标签:** ${summary.overseasTags.join(', ')}\n` : ''}**${L.oneSentenceLabel}:** ${summary.oneSentence}

### ${L.plotSummaryLabel}
${summary.plotSummary}

### ${L.coreConclusion}
${summary.coreConclusion}

`;
  } else {
    md += `## ${L.executiveSummary}

**${L.oneSentenceSummary}:** ${result.summary.oneSentence}

${result.summary.paragraph}

`;
  }

  // 详细分析
  if (includeDetailedAnalysis && advancedResult?.detailedAnalysis) {
    const da = advancedResult.detailedAnalysis;

    md += `## ${L.detailedAnalysis}

### ${L.sectionA}

${renderMarkdownDimension(getDimensionLabel('targetAudience', lang), da.marketResonance.targetAudience, lang)}
${renderMarkdownDimension(getDimensionLabel('originality', lang), da.marketResonance.originality, lang)}
${renderMarkdownDimension(getDimensionLabel('trendAlignment', lang), da.marketResonance.trendAlignment, lang)}

### ${L.sectionB}

${renderMarkdownDimension(getDimensionLabel('narrativeLogic', lang), da.narrativeDNA.narrativeLogic, lang)}
${renderMarkdownDimension(getDimensionLabel('hookStrength', lang), da.narrativeDNA.hookStrength, lang)}
${renderMarkdownDimension(getDimensionLabel('pleasureDesign', lang), da.narrativeDNA.pleasureDesign, lang)}
${renderMarkdownDimension(getDimensionLabel('pacingStructure', lang), da.narrativeDNA.pacingStructure, lang)}
${renderMarkdownDimension(getDimensionLabel('plotCoherence', lang), da.narrativeDNA.plotCoherence, lang)}
${renderMarkdownDimension(getDimensionLabel('characterization', lang), da.narrativeDNA.characterization, lang)}
${renderMarkdownDimension(getDimensionLabel('dialogueQuality', lang), da.narrativeDNA.dialogueQuality, lang)}
${renderMarkdownDimension(getDimensionLabel('suspenseEffectiveness', lang), da.narrativeDNA.suspenseEffectiveness, lang)}

### ${L.sectionC}

${renderMarkdownDimension(getDimensionLabel('userStickiness', lang), da.commercialPotential.userStickiness, lang)}
${renderMarkdownDimension(getDimensionLabel('viralPotential', lang), da.commercialPotential.viralPotential, lang)}

### ${L.sectionD}

${renderMarkdownDimension(getDimensionLabel('contentCompliance', lang), da.complianceAssessment.contentCompliance, lang)}
${renderMarkdownDimension(getDimensionLabel('valueOrientation', lang), da.complianceAssessment.valueOrientation, lang)}

`;
  }

  // 可操作建议
  if (includeRecommendations && advancedResult?.actionableRecommendations?.length) {
    md += `## ${L.actionableRecommendations}

`;
    advancedResult.actionableRecommendations.forEach(rec => {
      md += `**${rec.priority}. ${rec.title}**

${rec.description}

`;
    });
  }

  const businessLoop = advancedResult?.finalSummary?.businessClosedLoop;
  if (businessLoop) {
    const kpiSep = '｜';
    const kpiTargetLabel = '目标';
    const kpiWindowLabel = '周期';
    const kpiOwnerLabel = '负责人';
    md += `## ${L.businessClosedLoop}

### ${L.targetPositioning}
${businessLoop.targetPositioning}

### ${L.monetizationPath}
${businessLoop.monetizationPath.map((item) => `- ${item}`).join('\n')}

### ${L.launchPlan}
${businessLoop.launchPlan.map((item) => `- ${item}`).join('\n')}

### ${L.kpiDashboard}
${businessLoop.kpiDashboard.map((kpi) => `- ${kpi.metric}${kpiSep}${kpiTargetLabel}: ${kpi.target}${kpiSep}${kpiWindowLabel}: ${kpi.window}${kpi.owner ? `${kpiSep}${kpiOwnerLabel}: ${kpi.owner}` : ''}`).join('\n')}

### ${L.validationExperiments}
${businessLoop.validationExperiments.map((item) => `- ${item}`).join('\n')}

### ${L.riskMitigation}
${businessLoop.riskMitigation.map((item) => `- ${item}`).join('\n')}

### ${L.nextQuarterGoal}
${businessLoop.nextQuarterGoal}

`;
  }

  md += `---

*${L.footerLine1}. ${L.footerLine2}*
`;

  return md;
}

/** 渲染 Markdown 维度分析 */
function renderMarkdownDimension(
  name: string,
  data: DimensionDetailedAnalysis,
  lang: OutputLanguage = 'zh'
): string {
  const L = getLabels(lang);
  const gradeText = lang === 'en' ? data.grade : `${data.grade}${L.gradeUnit}`;
  const scoreLabel = lang === 'en' ? 'Score' : '评分';

  let md = `#### ${name}
**${scoreLabel}:** ${data.score}/100 (${gradeText})

${data.analysis || L.noAnalysis}

`;

  if (data.keyFindings && data.keyFindings.length > 0) {
    md += `**${L.keyFindingsTitle}:**
${data.keyFindings.map(item => `- ${item}`).join('\n')}

`;
  }

  if (data.evidence && data.evidence.length > 0) {
    md += `**${L.evidenceTitle}:**
${data.evidence.map(item => `- *${item}*`).join('\n')}

`;
  }

  if (data.strengths && data.strengths.length > 0) {
    md += `**${L.strengthsTitle}:**
${data.strengths.map(item => `- ${item}`).join('\n')}

`;
  }

  if (data.improvements && data.improvements.length > 0) {
    md += `**${L.improvementsTitle}:**
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
export function exportPDFReport(html: string, title = 'Script Rating Report'): void {
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
  const lang: OutputLanguage = 'zh'; // 始终中文
  const defaultName = '剧本评级报告';
  const scriptName = options.scriptName || defaultName;
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
  const defaultName = '剧本评级报告';
  exportPDFReport(html, options.scriptName || defaultName);
}
