/**
 * 互动剧系统 — 端到端测试用例
 *
 * 使用方法：
 *   cd E:\SHWX\ai-\proxy
 *   node __tests__/interactive-drama-e2e.test.js
 *
 * 前提：proxy 服务器需要在 3003 端口运行（npm start）
 */

const BASE = 'http://localhost:3003/api/interactive-drama';

let lakeId = null;
let sessionId = null;
let nodeMap = {}; // tempId → realId
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data.data;
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data.data;
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data.data;
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  const data = await res.json();
  return data;
}

// ================================================================
// 测试 1: 故事湖 CRUD
// ================================================================
async function test1_LakeCRUD() {
  console.log('\n--- 测试 1: 故事湖 CRUD ---');

  // 创建
  const lake = await post('/lakes', { title: '测试·修仙之路' });
  lakeId = lake.id;
  assert(!!lakeId, '创建故事湖成功');
  assert(lake.title === '测试·修仙之路', '标题正确');
  assert(lake.status === 'draft', '初始状态为 draft');

  // 列表
  const list = await get('/lakes');
  assert(list.length > 0, '列表包含新创建的故事湖');

  // 更新 creationProfile
  const updated = await put(`/lakes/${lakeId}`, {
    title: '修仙之路·改',
    creationProfile: {
      coreIdea: '重生修仙，逆天改命',
      targetAudience: '18-25岁女性',
      emotionalArc: '先虐后燃',
      characters: [
        { name: '林月', identity: '重生者', personality: '坚韧冷静', motivation: '复仇+守护', relationship: '主角' },
        { name: '慕尘', identity: '剑宗大师兄', personality: '外冷内热', motivation: '守护宗门', relationship: 'CP' },
      ],
      worldSetting: '修仙世界，三界九域，灵气稀薄。修炼境界：练气→筑基→金丹→元婴→化神',
      keyEvents: [
        { description: '林月在宗门试炼中发现师父是灭族的参与者', expectedTiming: '第3-5节点' },
        { description: '慕尘为保护林月暴露隐藏修为', expectedTiming: '第6-8节点' },
      ],
      endings: [
        { name: '携手飞升', type: 'good', description: '两人携手破解阴谋，双双飞升' },
        { name: '独自成魔', type: 'bad', description: '林月复仇心切，入魔道独自离去' },
        { name: '牺牲守护', type: 'true', description: '慕尘牺牲自己，林月继承遗志' },
      ],
      styleParams: { pacingDensity: 'standard', branchDensity: 3, allowMerge: true },
    },
  });
  assert(updated.title === '修仙之路·改', '标题更新正确');
  assert(updated.creationProfile.coreIdea === '重生修仙，逆天改命', 'creationProfile 更新正确');
  assert(updated.creationProfile.characters.length === 2, '角色数量正确');
  assert(updated.creationProfile.endings.length === 3, '结局数量正确');

  // 获取完整数据
  const full = await get(`/lakes/${lakeId}`);
  assert(!!full.nodes, '包含 nodes');
  assert(!!full.edges, '包含 edges');
  assert(!!full.variables, '包含 variables');

  console.log(`  → lakeId: ${lakeId}`);
}

// ================================================================
// 测试 2: 手动创建节点和边 (模拟大纲确认)
// ================================================================
async function test2_NodesAndEdges() {
  console.log('\n--- 测试 2: 节点和边 CRUD ---');

  // 手动创建节点 (模拟 replaceOutline)
  const nodeData = [
    { lakeId, type: 'start', title: '重生醒来', content: '你睁开眼睛，发现自己回到了三年前的宗门考核现场。前世的记忆如潮水般涌来——你知道，今天的选择将决定所有人的命运。', sortOrder: 1 },
    { lakeId, type: 'choice', title: '前往宗门', content: '你决定利用前世记忆，提前进入宗门核心。御剑飞行时，你注意到天边有一道熟悉的身影。', sortOrder: 2 },
    { lakeId, type: 'choice', title: '留在凡间', content: '你选择先不急着回宗门。前世太急功近利，这次你要在凡间打好根基。', sortOrder: 3 },
    { lakeId, type: 'merge', title: '宗门试炼', content: '无论你是怎么来的，宗门试炼如期而至。你注意到试炼的内容和前世有所不同——有人在暗中改变了规则。', sortOrder: 4 },
    { lakeId, type: 'ending', title: '携手飞升', content: '在慕尘的帮助下，你成功揭穿了师父的阴谋。两人在九天之上并肩而立，周围是祝贺的仙光。从此，执子之手，与子偕老，仙界又多了一对神仙眷侣。', sortOrder: 5 },
    { lakeId, type: 'ending', title: '独自成魔', content: '复仇的火焰吞噬了你。你杀死了师父，却也永远失去了慕尘的信任。最后，你独自站在魔界的边缘，身后是血红的天。力量有了，心却空了。', sortOrder: 6 },
    { lakeId, type: 'ending', title: '牺牲守护', content: '慕尘倒在你怀里的那一刻，你终于明白了他每次看向你时眼神中的深意。他用生命封住了魔界裂缝，而你将带着他的剑，继续守护这片他爱过的世界。', sortOrder: 7 },
  ];

  // 先用 API 创建节点
  for (const n of nodeData) {
    const node = await post(`/lakes/${lakeId}/nodes`, n);
    nodeMap[n.title] = node.id;
  }
  assert(Object.keys(nodeMap).length === 7, '7个节点创建成功');

  // 创建边
  const edges = [
    { lakeId, fromNodeId: nodeMap['重生醒来'], toNodeId: nodeMap['前往宗门'], optionText: '御剑前往宗门', stateChanges: [{ variable: 'affection', operator: 'add', value: 10 }, { variable: 'approach', operator: 'set', value: 'direct' }] },
    { lakeId, fromNodeId: nodeMap['重生醒来'], toNodeId: nodeMap['留在凡间'], optionText: '步行下山历练', stateChanges: [{ variable: 'affection', operator: 'add', value: 5 }, { variable: 'approach', operator: 'set', value: 'patient' }] },
    { lakeId, fromNodeId: nodeMap['前往宗门'], toNodeId: nodeMap['宗门试炼'], optionText: '参加宗门试炼' },
    { lakeId, fromNodeId: nodeMap['留在凡间'], toNodeId: nodeMap['宗门试炼'], optionText: '偶遇宗门使者' },
    { lakeId, fromNodeId: nodeMap['宗门试炼'], toNodeId: nodeMap['携手飞升'], optionText: '与慕尘联手', conditions: { affection: { gte: 8 }, approach: { eq: 'direct' } } },
    { lakeId, fromNodeId: nodeMap['宗门试炼'], toNodeId: nodeMap['独自成魔'], optionText: '独自复仇', conditions: { affection: { lte: 5 } } },
    { lakeId, fromNodeId: nodeMap['宗门试炼'], toNodeId: nodeMap['牺牲守护'], optionText: '为慕尘挡下致命一击', conditions: { affection: { gte: 6 } } },
  ];

  for (const e of edges) {
    const edge = await post('/edges', e);
    assert(!!edge.id, `边创建成功: ${e.optionText}`);
  }

  // 验证节点和边数量
  const nodes = await get(`/lakes/${lakeId}/nodes`);
  assert(nodes.length === 7, '节点总数 7');

  // Note: API 的 GET /lakes/:id 会返回 edges, 但 GET /lakes/:id/nodes 只返回 nodes
  const full = await get(`/lakes/${lakeId}`);
  assert(full.edges.length === 7, '边总数 7');
}

// ================================================================
// 测试 3: 播放器状态机
// ================================================================
async function test3_PlayerStateMachine() {
  console.log('\n--- 测试 3: 播放器状态机 ---');

  // 状态变量: 系统会从 edge.stateChanges 自动追踪变量
  // 无需手动创建变量——播放器状态机会自动处理
  console.log('  状态变量由 stateChanges 自动管理，无需手动创建');

  // 开始播放
  const session = await post(`/lakes/${lakeId}/sessions`, {});
  sessionId = session.sessionId;
  assert(!!sessionId, '创建播放会话成功');
  assert(session.currentNode.title === '重生醒来', '起始节点正确');
  assert(session.status === 'playing', '状态为 playing');
  assert(session.availableEdges.length === 2, '有两个可用选项');
  console.log(`  起始节点: "${session.currentNode.title}"`);
  console.log(`  可用选项: ${session.availableEdges.map(e => `"${e.optionText}"`).join(', ')}`);

  // 选择: 御剑前往宗门 (affection +10, approach = 'direct')
  const edgeDirect = session.availableEdges.find(e => e.optionText.includes('御剑'));
  assert(!!edgeDirect, '找到"御剑前往宗门"选项');
  const state1 = await post(`/sessions/${sessionId}/choose`, { edgeId: edgeDirect.id });
  assert(state1.currentNode.title === '前往宗门', '到达"前往宗门"');
  assert(state1.currentState.affection === 10, 'affection 增加到 10');
  assert(state1.currentState.approach === 'direct', 'approach 设置为 direct');
  console.log(`  选择: "${edgeDirect.optionText}" → "${state1.currentNode.title}"`);
  console.log(`  状态: affection=${state1.currentState.affection}, approach=${state1.currentState.approach}`);

  // 选择: 参加宗门试炼
  const edgeTrial = state1.availableEdges.find(e => e.optionText.includes('试炼'));
  assert(!!edgeTrial, '找到"参加宗门试炼"选项');
  const state2 = await post(`/sessions/${sessionId}/choose`, { edgeId: edgeTrial.id });
  assert(state2.currentNode.title === '宗门试炼', '到达汇合节点"宗门试炼"');
  console.log(`  选择: "${edgeTrial.optionText}" → "${state2.currentNode.title}"`);

  // 验证条件过滤: affection=10, approach='direct'
  // "与慕尘联手": affection>=8 AND approach='direct' → 应该可见
  // "独自复仇": affection<=5 → 应该不可见 (affection=10)
  // "为慕尘挡下致命一击": affection>=6 → 应该可见
  const edgeNames = state2.availableEdges.map(e => e.optionText);
  console.log(`  可用选项: ${edgeNames.map(e => `"${e}"`).join(', ')}`);

  assert(edgeNames.some(n => n.includes('慕尘联手')), '"与慕尘联手" 可见 (affection=10 >= 8, approach=direct)');
  assert(!edgeNames.some(n => n.includes('独自复仇')), '"独自复仇" 不可见 (affection=10 > 5, 条件不满足)');
  assert(edgeNames.some(n => n.includes('挡下致命一击')), '"为慕尘挡下致命一击" 可见 (affection=10 >= 6)');

  // 选择: 与慕尘联手 → 到达好结局
  const edgeGood = state2.availableEdges.find(e => e.optionText.includes('慕尘联手'));
  const state3 = await post(`/sessions/${sessionId}/choose`, { edgeId: edgeGood.id });
  assert(state3.currentNode.title === '携手飞升', '到达好结局"携手飞升"');
  assert(state3.currentNode.type === 'ending', '节点类型为 ending');
  assert(state3.status === 'ended', '会话状态为 ended');
  console.log(`  选择: "${edgeGood.optionText}" → "${state3.currentNode.title}" (结局!)`);
  console.log(`  结局内容预览: ${state3.currentNode.content.slice(0, 50)}...`);
}

// ================================================================
// 测试 4: 重置并走另一条路线
// ================================================================
async function test4_DifferentPath() {
  console.log('\n--- 测试 4: 不同路线走向不同结局 ---');

  // 创建新会话
  const session = await post(`/lakes/${lakeId}/sessions`, {});
  const session2Id = session.sessionId;

  // 选"步行下山历练" (affection +5, approach = 'patient')
  const edgePatient = session.availableEdges.find(e => e.optionText.includes('步行'));
  const state1 = await post(`/sessions/${session2Id}/choose`, { edgeId: edgePatient.id });
  console.log(`  选择: "${edgePatient.optionText}" → affection=${state1.currentState.affection}, approach=${state1.currentState.approach}`);

  // 偶遇宗门使者 → 宗门试炼
  const edgeMeet = state1.availableEdges[0];
  const state2 = await post(`/sessions/${session2Id}/choose`, { edgeId: edgeMeet.id });
  console.log(`  到达: "${state2.currentNode.title}"`);

  // affection=5, approach='patient'
  // "与慕尘联手": affection>=8 AND approach='direct' → 不可见 (affection=5, approach=patient)
  // "独自复仇": affection<=5 → 可见
  // "为慕尘挡下致命一击": affection>=6 → 不可见 (affection=5)
  const edgeNames = state2.availableEdges.map(e => e.optionText);
  console.log(`  可用选项: ${edgeNames.map(e => `"${e}"`).join(', ')}`);

  assert(!edgeNames.some(n => n.includes('慕尘联手')), '"与慕尘联手" 不可见 (affection=5 < 8, approach≠direct)');
  assert(edgeNames.some(n => n.includes('独自复仇')), '"独自复仇" 可见 (affection=5 <= 5)');
  console.log(`  验证: 两条路线 → 不同可用选项 → 不同结局`);

  // 清理
  await del(`/sessions/${session2Id}`);
  console.log('  会话已清理');
}

// ================================================================
// 测试 5: 清理
// ================================================================
async function test5_Cleanup() {
  console.log('\n--- 测试 5: 清理 ---');
  if (lakeId) {
    await del(`/lakes/${lakeId}`);
    const list = await get('/lakes');
    assert(list.every(l => l.id !== lakeId), '故事湖已删除');
    console.log(`  故事湖 ${lakeId} 已删除`);
  }
}

// ================================================================
// 主流程
// ================================================================
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  互动剧系统 — E2E 测试                   ║');
  console.log('║  测试目标: http://localhost:3003         ║');
  console.log('╚══════════════════════════════════════════╝');

  // 检查服务是否在线
  try {
    await fetch('http://localhost:3003/health');
  } catch {
    console.error('\n❌ proxy 服务器未启动！请先运行: cd E:\\SHWX\\ai-\\proxy && npm start');
    process.exit(1);
  }

  const start = Date.now();

  try {
    await test1_LakeCRUD();
    await test2_NodesAndEdges();
    await test3_PlayerStateMachine();
    await test4_DifferentPath();
    await test5_Cleanup();
  } catch (e) {
    console.error(`\n❌ 测试异常: ${e.message}`);
    console.error(e.stack);
    failed++;
  }

  const elapsed = Date.now() - start;
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  总计: ${passed + failed} 项, 通过: ${passed}, 失败: ${failed}`);
  console.log(`  耗时: ${(elapsed / 1000).toFixed(1)}s`);
  console.log(`═══════════════════════════════════════`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
