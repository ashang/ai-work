
export const generatePlan = (startDate) => {
  const plan = [];
  const start = new Date(startDate);
  const raceDate = new Date(start);
  raceDate.setMonth(raceDate.getMonth() + 10);
  
  // Total weeks approx 43
  const totalWeeks = 43;

  for (let w = 1; w <= totalWeeks; w++) {
    let phase = '';
    let focus = '';
    let volume = 0;
    
    if (w <= 8) {
      phase = '基础期 (Base)';
      focus = '建立跑步习惯，轻松跑';
    } else if (w <= 16) {
      phase = '进阶期 I (Build 1)';
      focus = '增加跑量，提升耐力';
    } else if (w <= 24) {
      phase = '进阶期 II (Build 2)';
      focus = '加入节奏跑，强化心肺';
    } else if (w <= 32) {
      phase = '强化期 (Strength)';
      focus = '长距离，间歇跑';
    } else if (w <= 39) {
      phase = '巅峰期 (Peak)';
      focus = '最大跑量，模拟比赛';
    } else {
      phase = '减量期 (Taper)';
      focus = '恢复体能，准备比赛';
    }

    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (w - 1) * 7);

    const weekData = {
      week: w,
      phase,
      focus,
      days: []
    };

    // Generate daily runs
    for (let d = 0; d < 7; d++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + d);
      const dayName = currentDay.toLocaleDateString('zh-CN', { weekday: 'long' });
      
      let activity = '休息';
      let type = 'rest';
      let distance = 0; // km

      // Simple schedule pattern
      // Mon: Rest
      // Tue: Easy
      // Wed: Interval/Tempo (or Rest in base)
      // Thu: Easy
      // Fri: Rest
      // Sat: Long Run (or Sun)
      // Sun: Rest or Easy
      
      if (w <= 8) { // Base: Tue, Thu, Sat
        if (d === 1) { activity = '轻松跑 5km'; type = 'easy'; distance = 5; }
        if (d === 3) { activity = '轻松跑 5km'; type = 'easy'; distance = 5; }
        if (d === 5) { activity = '长距离慢跑 8-10km'; type = 'long'; distance = 10; }
      } else if (w <= 16) { // Build 1: Tue, Thu, Sat, Sun
        if (d === 1) { activity = '轻松跑 6km'; type = 'easy'; distance = 6; }
        if (d === 3) { activity = '节奏跑 6km'; type = 'tempo'; distance = 6; }
        if (d === 5) { activity = '长距离 12-15km'; type = 'long'; distance = 15; }
        if (d === 6) { activity = '恢复跑 5km'; type = 'recovery'; distance = 5; }
      } else if (w <= 24) { // Build 2
        if (d === 1) { activity = '轻松跑 8km'; type = 'easy'; distance = 8; }
        if (d === 2) { activity = '间歇跑 8x400m'; type = 'interval'; distance = 8; }
        if (d === 4) { activity = '轻松跑 6km'; type = 'easy'; distance = 6; }
        if (d === 5) { activity = '长距离 18-22km'; type = 'long'; distance = 22; }
      } else if (w <= 32) { // Strength
        if (d === 1) { activity = '轻松跑 10km'; type = 'easy'; distance = 10; }
        if (d === 2) { activity = '亚索800 6-8组'; type = 'interval'; distance = 10; }
        if (d === 3) { activity = '轻松跑 8km'; type = 'easy'; distance = 8; }
        if (d === 5) { activity = '长距离 25km'; type = 'long'; distance = 25; }
        if (d === 6) { activity = '恢复跑 6km'; type = 'recovery'; distance = 6; }
      } else if (w <= 39) { // Peak
        if (d === 1) { activity = '轻松跑 10km'; type = 'easy'; distance = 10; }
        if (d === 2) { activity = '节奏跑 10-12km'; type = 'tempo'; distance = 12; }
        if (d === 3) { activity = '轻松跑 10km'; type = 'easy'; distance = 10; }
        if (d === 5) { activity = 'LSD 30-32km'; type = 'long'; distance = 32; }
        if (d === 6) { activity = '恢复跑 8km'; type = 'recovery'; distance = 8; }
      } else { // Taper
        if (d === 1) { activity = '轻松跑 6-8km'; type = 'easy'; distance = 6; }
        if (d === 3) { activity = '马拉松配速跑 5km'; type = 'tempo'; distance = 5; }
        if (d === 5) { 
            if (w === totalWeeks) activity = '北京马拉松 (目标 4:30)'; 
            else activity = '轻松跑 10km'; 
            type = w === totalWeeks ? 'race' : 'easy'; 
            distance = w === totalWeeks ? 42.195 : 10;
        }
      }

      weekData.days.push({
        date: currentDay,
        dayName,
        activity,
        type,
        distance
      });
    }
    plan.push(weekData);
  }
  return plan;
};

export const getDietAdvice = () => {
  return [
    {
      title: '日常饮食原则',
      content: '碳水化合物 55-60%, 蛋白质 20-25%, 脂肪 20-25%。多吃全谷物、瘦肉、鱼类、蔬菜水果。避免过多加工食品和糖分。'
    },
    {
      title: '训练前 (Pre-run)',
      content: '跑前1-2小时：补充易消化的碳水化合物（如香蕉、吐司、燕麦）。避免高纤维和高脂肪食物以免肠胃不适。'
    },
    {
      title: '训练中 (During run)',
      content: '超过1小时的训练需要补水。超过90分钟建议补充电解质饮料和能量胶（每45-60分钟一个）。'
    },
    {
      title: '训练后 (Post-run)',
      content: '跑后30分钟内：黄金恢复期。补充碳水+蛋白质（比例3:1 or 4:1），如巧克力奶、蛋白粉加香蕉、鸡蛋三明治。帮助肌肉修复和糖原储备。'
    },
    {
      title: '比赛周饮食 (Carb Loading)',
      content: '比赛前3天开始增加碳水摄入比例至70%，减少脂肪和纤维摄入。多喝水，保证身体水合状态良好。'
    }
  ];
};
