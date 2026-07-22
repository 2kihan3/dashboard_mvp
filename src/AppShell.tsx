import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessageSquare,
  Network,
  Search,
  Settings,
} from 'lucide-react'
import './App.css'
import ChatbotPage from './pages/ChatbotPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import SkillsPage from './pages/SkillsPage'
import ProvenancePage from './pages/ProvenancePage'

export type AppSection = 'chatbot' | 'dashboard' | 'tasks' | 'skills' | 'provenance'

type RoleTone = 'aqua' | 'amber' | 'blue' | 'green'

interface Role {
  key: string
  label: string
  name: string
  avatar: string
  tone: RoleTone
  desc: string
}

interface NotificationItem {
  id: string
  tone: 'normal' | 'alert' | 'success'
  type: 'exception' | 'task' | 'report'
  title: string
  body: string
  time: string
  unread: boolean
}

const roles: Role[] = [
  { key: 'ops', label: '运营', name: '李运营', avatar: '李', tone: 'aqua', desc: '查看所负责平台与店铺' },
  { key: 'finance', label: '财务', name: '王财务', avatar: '王', tone: 'amber', desc: '复核日报与费用口径' },
  { key: 'admin', label: '管理员', name: '张管理员', avatar: '张', tone: 'blue', desc: '全部数据与权限管理' },
  { key: 'analyst', label: '数据分析师', name: '陈分析', avatar: '陈', tone: 'green', desc: '分析与归因查询' },
]

const notifications: NotificationItem[] = [
  { id: 'n1', tone: 'alert', type: 'exception', title: '快手 7/13 推广费 ROI 异常', body: '「品牌专区-7月」ROI 1.41，低于阈值 1.8，建议复核', time: '5 分钟前', unread: true },
  { id: 'n2', tone: 'normal', type: 'task', title: '唯品会日报待复核', body: '7/13 唯品会交叉验证未通过，等待人工复核', time: '32 分钟前', unread: true },
  { id: 'n3', tone: 'success', type: 'report', title: '爱库存日报已发布', body: '7/13 爱库存 2 家店铺日报已写入数据台账', time: '1 小时前', unread: false },
  { id: 'n4', tone: 'alert', type: 'exception', title: '抖店任务失败', body: '授权令牌失效，请前往 skill 市场重新授权', time: '2 小时前', unread: false },
  { id: 'n5', tone: 'normal', type: 'task', title: '好衣库任务已完成', body: '7/13 好衣库日报已生成，待发布', time: '3 小时前', unread: false },
  { id: 'n6', tone: 'success', type: 'report', title: '快手日报已发布', body: '7/13 快手官方旗舰店日报已发布到数据中心', time: '5 小时前', unread: false },
]

type NotifFilter = 'all' | 'exception' | 'task' | 'report'
const notifFilterTabs: Array<{ key: NotifFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'exception', label: '异常' },
  { key: 'task', label: '任务' },
  { key: 'report', label: '报告' },
]

interface NavItem {
  key: AppSection
  label: string
  eyebrow: string
  description: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { key: 'chatbot', label: 'chatbot', eyebrow: 'operating_engine', description: '与经营引擎对话，追问任何经营问题', icon: <MessageSquare aria-hidden="true" /> },
  { key: 'dashboard', label: '经营看板', eyebrow: 'business_dashboard', description: '多平台经营指标与趋势', icon: <LayoutDashboard aria-hidden="true" /> },
  { key: 'tasks', label: '数据中心', eyebrow: 'data_center', description: '日报任务记录与日报数据', icon: <ListTodo aria-hidden="true" /> },
  { key: 'skills', label: 'skill 市场', eyebrow: 'skill_market', description: '电商经营场景的可复用技能', icon: <Boxes aria-hidden="true" /> },
  { key: 'provenance', label: '数据溯源', eyebrow: 'data_provenance', description: '全链路追溯（筹备中）', icon: <Network aria-hidden="true" /> },
]

const validHashes: AppSection[] = ['chatbot', 'dashboard', 'tasks', 'skills', 'provenance']

function parseHash(): AppSection {
  const raw = window.location.hash.replace(/^#/, '')
  return validHashes.includes(raw as AppSection) ? (raw as AppSection) : 'chatbot'
}

export default function AppShell() {
  const [section, setSection] = useState<AppSection>(parseHash)

  useEffect(() => {
    if (!window.location.hash || !validHashes.includes(window.location.hash.replace(/^#/, '') as AppSection)) {
      window.location.hash = '#chatbot'
    }
    const handleHashChange = () => setSection(parseHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (target: AppSection) => {
    window.location.hash = `#${target}`
    setSection(target)
  }

  const [currentRoleKey, setCurrentRoleKey] = useState(roles[0].key)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifList, setNotifList] = useState(notifications)
  const [notifFilter, setNotifFilter] = useState<NotifFilter>('all')
  const headerActionsRef = useRef<HTMLDivElement>(null)

  const currentRole = roles.find((role) => role.key === currentRoleKey) ?? roles[0]
  const unreadCount = notifList.filter((item) => item.unread).length
  const filteredNotifs = notifFilter === 'all' ? notifList : notifList.filter((item) => item.type === notifFilter)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (headerActionsRef.current && !headerActionsRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">澄</div>
          <div>
            <strong>经营引擎</strong>
            <span>澄明 · 电商经营智能体</span>
          </div>
        </div>

        <nav className="nav" aria-label="主导航">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={section === item.key ? 'active' : ''}
              onClick={() => navigate(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
              <i className="nav-active-dot" aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <CalendarDays aria-hidden="true" />
          <p>默认口径为前一天 00:00:00–23:59:59；周维度按自然周汇总；所有数据均为示例。</p>
        </div>

        <div className="sidebar-foot">
          <span className="eyebrow">build · v0.2</span>
          <p>5 板块外壳 + 看板合并 + chatbot 三栏示例</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-search">
            <Search aria-hidden="true" />
            <input type="text" placeholder="搜索店铺、任务、技能或数据..." aria-label="全局搜索" />
            <kbd>⌘K</kbd>
          </div>
          <div className="topbar-actions" ref={headerActionsRef}>
            <button
              type="button"
              className="topbar-icon-btn"
              aria-label="消息提醒"
              onClick={() => { setNotifOpen((open) => !open); setUserMenuOpen(false) }}
            >
              <Bell aria-hidden="true" />
              {unreadCount > 0 ? <span className="topbar-dot">{unreadCount}</span> : null}
            </button>

            <button
              type="button"
              className="topbar-user"
              onClick={() => { setUserMenuOpen((open) => !open); setNotifOpen(false) }}
            >
              <span className={`topbar-avatar topbar-avatar--${currentRole.tone}`}>{currentRole.avatar}</span>
              <div>
                <strong>{currentRole.name}</strong>
                <span>{currentRole.label}</span>
              </div>
              <ChevronDown aria-hidden="true" />
            </button>

            {notifOpen ? (
              <div className="topbar-dropdown topbar-dropdown--notif" role="dialog" aria-label="消息提醒">
                <header className="topbar-dropdown__head">
                  <strong>消息提醒</strong>
                  <span>{unreadCount} 条未读</span>
                </header>
                <div className="notif-filter-tabs" role="tablist" aria-label="消息类型筛选">
                  {notifFilterTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={notifFilter === tab.key}
                      className={notifFilter === tab.key ? 'active' : ''}
                      onClick={() => setNotifFilter(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="notification-list">
                  {filteredNotifs.map((item) => (
                    <article key={item.id} className={`notification-item notification-item--${item.tone} ${item.unread ? 'unread' : ''}`}>
                      <span className="notification-item__icon">
                        {item.tone === 'alert' ? <AlertTriangle aria-hidden="true" /> : item.tone === 'success' ? <CheckCircle2 aria-hidden="true" /> : <MessageSquare aria-hidden="true" />}
                      </span>
                      <div className="notification-item__body">
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                        <time>{item.time}</time>
                      </div>
                      {item.unread ? <span className="notification-item__unread" aria-label="未读" /> : null}
                    </article>
                  ))}
                  {filteredNotifs.length === 0 ? <p className="notif-empty">该类型暂无消息</p> : null}
                </div>
                <footer className="topbar-dropdown__foot">
                  <button type="button" onClick={() => setNotifList((list) => list.map((item) => ({ ...item, unread: false })))}>全部标记已读</button>
                  <button type="button">查看全部</button>
                </footer>
              </div>
            ) : null}

            {userMenuOpen ? (
              <div className="topbar-dropdown topbar-dropdown--user" role="dialog" aria-label="账号切换">
                <header className="topbar-dropdown__head">
                  <strong>切换账号角色</strong>
                  <span>当前 · {currentRole.label}</span>
                </header>
                <div className="role-list">
                  {roles.map((role) => (
                    <button
                      key={role.key}
                      type="button"
                      className={role.key === currentRoleKey ? 'active' : ''}
                      onClick={() => { setCurrentRoleKey(role.key); setUserMenuOpen(false) }}
                    >
                      <span className={`topbar-avatar topbar-avatar--${role.tone}`}>{role.avatar}</span>
                      <div>
                        <strong>{role.name}</strong>
                        <small>{role.label} · {role.desc}</small>
                      </div>
                      <Check className="role-check" aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <footer className="topbar-dropdown__foot">
                  <button type="button"><Settings aria-hidden="true" />账号设置</button>
                  <button type="button"><LogOut aria-hidden="true" />退出登录</button>
                </footer>
              </div>
            ) : null}
          </div>
        </header>

        <div className="main__content">
          {section === 'chatbot' ? <ChatbotPage /> : null}
          {section === 'dashboard' ? <DashboardPage /> : null}
          {section === 'tasks' ? <TasksPage /> : null}
          {section === 'skills' ? <SkillsPage /> : null}
          {section === 'provenance' ? <ProvenancePage /> : null}
        </div>
      </main>
    </div>
  )
}
