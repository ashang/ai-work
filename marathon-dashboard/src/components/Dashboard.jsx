import { useState, useMemo } from 'react';
import { generatePlan, getDietAdvice } from '../utils/planGenerator';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('plan');

    // Start plan from today
    const startDate = new Date();
    const plan = useMemo(() => generatePlan(startDate), [startDate]);
    const dietAdvice = useMemo(() => getDietAdvice(), []);

    // Calculate Race Date (last day of plan)
    const raceDate = plan[plan.length - 1].days[plan[plan.length - 1].days.length - 1].date;

    // Calculate days until race
    const daysUntilRace = Math.ceil((raceDate - new Date()) / (1000 * 60 * 60 * 24));

    // Stats
    const totalWeeklyAvg = 40; // Approx
    const goalTime = "4:30:00";

    return (
        <div className="container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">北马 430 挑战</h1>
                <p className="dashboard-subtitle">10个月全马备赛计划 • 目标完赛时间 {goalTime}</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{daysUntilRace}</div>
                    <div className="stat-label">距离比赛 (天)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{goalTime}</div>
                    <div className="stat-label">目标时间</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">43</div>
                    <div className="stat-label">总训练周数</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">450+</div>
                    <div className="stat-label">预计跑量 (km)</div>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plan')}
                >
                    训练日程
                </button>
                <button
                    className={`tab-btn ${activeTab === 'diet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('diet')}
                >
                    饮食建议
                </button>
            </div>

            {activeTab === 'plan' ? (
                <div className="plan-section">
                    {plan.map((weekData) => (
                        <div key={weekData.week} className="week-card">
                            <div className="week-header">
                                <span className="week-title">第 {weekData.week} 周</span>
                                <span className="week-phase">{weekData.phase}</span>
                            </div>
                            <div className="days-grid">
                                {weekData.days.map((day, idx) => (
                                    <div key={idx} className={`day-cell type-${day.type}`}>
                                        <div className="day-header">
                                            <span>{day.dayName}</span>
                                            <span>{day.date.getMonth() + 1}/{day.date.getDate()}</span>
                                        </div>
                                        <div className="day-activity">{day.activity}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="diet-section">
                    {dietAdvice.map((item, idx) => (
                        <div key={idx} className="diet-card">
                            <h3 className="diet-title">{item.title}</h3>
                            <p className="diet-content">{item.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
