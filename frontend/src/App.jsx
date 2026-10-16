
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Checkbox,
  Empty,
  Spin,
  Tooltip,
  message,
} from 'antd'
import {
  AppstoreOutlined,
  ToolOutlined,
  TeamOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  HistoryOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './App.css'

const { Header, Sider, Content } = Layout
const { Title, Text, Paragraph } = Typography

const API_BASE = 'http://localhost:8080/api'

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

const MAINTENANCE_OPTIONS = [
  { value: 'PREVENTIVE', label: 'Preventive' },
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'EMERGENCY', label: 'Emergency' },
]

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const errorMessage =
      (typeof data === 'string' && data) ||
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`

    throw new Error(errorMessage)
  }

  return data
}

function assetCode(asset) {
  return asset?.assetId ?? asset?.assetCode ?? `Asset #${asset?.id ?? ''}`
}

function statusColor(status) {
  const colors = {
    OPEN: 'gold',
    ASSIGNED: 'blue',
    IN_PROGRESS: 'processing',
    COMPLETED: 'success',
    CANCELLED: 'error',
    ACTIVE: 'success',
    OUT_OF_SERVICE: 'error',
  }

  return colors[status] || 'default'
}

function priorityColor(priority) {
  const colors = {
    LOW: 'green',
    MEDIUM: 'blue',
    HIGH: 'orange',
    CRITICAL: 'red',
  }

  return colors[priority] || 'default'
}

function readable(value) {
  if (!value) return '—'
  return String(value).replaceAll('_', ' ')
}

function dateText(value) {
  if (!value) return '—'
  const date = dayjs(value)
  return date.isValid() ? date.format('DD MMM YYYY') : String(value)
}

function allowedStatuses(status) {
  switch (status) {
    case 'OPEN':
      return ['ASSIGNED', 'CANCELLED']
    case 'ASSIGNED':
      return ['IN_PROGRESS', 'CANCELLED']
    case 'IN_PROGRESS':
      return ['COMPLETED']
    default:
      return []
  }
}

function App() {
const [messageApi, messageContextHolder] = message.useMessage()
  const [activePage, setActivePage] = useState('dashboard')

  const [assets, setAssets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [workOrderModalOpen, setWorkOrderModalOpen] = useState(false)
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const [technicianModalOpen, setTechnicianModalOpen] = useState(false)

  const [workOrderForm] = Form.useForm()
  const [assetForm] = Form.useForm()
  const [technicianForm] = Form.useForm()

  const [savingWorkOrder, setSavingWorkOrder] = useState(false)
  const [savingAsset, setSavingAsset] = useState(false)
  const [savingTechnician, setSavingTechnician] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [assetFilter, setAssetFilter] = useState('ALL')
  const [technicianFilter, setTechnicianFilter] = useState('ALL')

  const [selectedHistoryAsset, setSelectedHistoryAsset] = useState(null)
  const [maintenanceHistory, setMaintenanceHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const loadData = useCallback(async (showMessage = false) => {
    setLoading(true)
    setPageError('')

    try {
      const [assetData, technicianData, orderData] = await Promise.all([
        apiRequest('/assets'),
        apiRequest('/technicians'),
        apiRequest('/work-orders'),
      ])

      setAssets(Array.isArray(assetData) ? assetData : [])
      setTechnicians(Array.isArray(technicianData) ? technicianData : [])
      setWorkOrders(Array.isArray(orderData) ? orderData : [])

      if (showMessage) messageApi.success('Dashboard data refreshed')
    } catch (error) {
      setPageError(
        `${error.message}. Confirm that Spring Boot is running on http://localhost:8080.`
      )
    } finally {
      setLoading(false)
    }
  }, [messageApi])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((order) => {
      const orderAssetId = order.asset?.id ?? order.assetId
      const orderTechnicianId = order.technician?.id ?? order.technicianId

      return (
        (statusFilter === 'ALL' || order.status === statusFilter) &&
        (priorityFilter === 'ALL' || order.priority === priorityFilter) &&
        (assetFilter === 'ALL' || String(orderAssetId) === String(assetFilter)) &&
        (technicianFilter === 'ALL' ||
          String(orderTechnicianId ?? '') === String(technicianFilter))
      )
    })
  }, [workOrders, statusFilter, priorityFilter, assetFilter, technicianFilter])

  const stats = useMemo(() => ({
    total: workOrders.length,
    open: workOrders.filter((order) => order.status === 'OPEN').length,
    inProgress: workOrders.filter((order) => order.status === 'IN_PROGRESS').length,
    completed: workOrders.filter((order) => order.status === 'COMPLETED').length,
  }), [workOrders])

  const openWorkOrderModal = () => {
    workOrderForm.resetFields()
    workOrderForm.setFieldsValue({
      priority: 'MEDIUM',
      maintenanceType: 'PREVENTIVE',
      scheduledDate: dayjs(),
    })
    setWorkOrderModalOpen(true)
  }

  const openAssetModal = () => {
    assetForm.resetFields()
    assetForm.setFieldsValue({
      status: 'ACTIVE',
      usageHours: 0,
      usageCycles: 0,
    })
    setAssetModalOpen(true)
  }

  const openTechnicianModal = () => {
    technicianForm.resetFields()
    technicianForm.setFieldsValue({ available: true })
    setTechnicianModalOpen(true)
  }

  async function handleCreateWorkOrder(values) {
    setSavingWorkOrder(true)

    try {
      const payload = {
        workOrderNumber: values.workOrderNumber.trim(),
        title: values.title.trim(),
        description: values.description?.trim() || '',
        assetId: Number(values.assetId),
        technicianId: values.technicianId ? Number(values.technicianId) : null,
        priority: values.priority,
        maintenanceType: values.maintenanceType,
        scheduledDate: values.scheduledDate.format('YYYY-MM-DD'),
      }

      await apiRequest('/work-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      messageApi.success('Work order created successfully')
      setWorkOrderModalOpen(false)
      workOrderForm.resetFields()
      await loadData()
    } catch (error) {
      messageApi.error(error.message)
    } finally {
      setSavingWorkOrder(false)
    }
  }

  async function handleCreateAsset(values) {
    setSavingAsset(true)

    try {
      const payload = {
        assetId: values.assetId.trim(),
        assetType: values.assetType.trim(),
        manufacturer: values.manufacturer?.trim() || '',
        model: values.model?.trim() || '',
        serialNumber: values.serialNumber?.trim() || '',
        usageHours: values.usageHours ?? 0,
        usageCycles: values.usageCycles ?? 0,
        status: values.status,
      }

      await apiRequest('/assets', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      messageApi.success('Asset registered successfully')
      setAssetModalOpen(false)
      assetForm.resetFields()
      await loadData()
    } catch (error) {
      messageApi.error(error.message)
    } finally {
      setSavingAsset(false)
    }
  }

  async function handleCreateTechnician(values) {
    setSavingTechnician(true)

    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || '',
        specialization: values.specialization.trim(),
        available: values.available ?? true,
      }

      await apiRequest('/technicians', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      messageApi.success('Technician registered successfully')
      setTechnicianModalOpen(false)
      technicianForm.resetFields()
      await loadData()
    } catch (error) {
      messageApi.error(error.message)
    } finally {
      setSavingTechnician(false)
    }
  }

  async function handleStatusChange(order, nextStatus) {
    if (!nextStatus || nextStatus === order.status) return

    setUpdatingOrderId(order.id)

    try {
      await apiRequest(`/work-orders/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      })

      messageApi.success(`${order.workOrderNumber} updated to ${readable(nextStatus)}`)
      await loadData()
    } catch (error) {
      messageApi.error(error.message)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleLoadHistory() {
    if (!selectedHistoryAsset) {
      messageApi.warning('Select an asset first')
      return
    }

    setLoadingHistory(true)
    setHistoryLoaded(false)

    try {
      const data = await apiRequest(`/assets/${selectedHistoryAsset}/history`)
      setMaintenanceHistory(Array.isArray(data) ? data : [])
      setHistoryLoaded(true)
    } catch (error) {
      messageApi.error(error.message)
    } finally {
      setLoadingHistory(false)
    }
  }

  const workOrderColumns = [
    {
      title: 'Work order',
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber',
      render: (value, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{value || `WO-${record.id}`}</Text>
          <Text type="secondary" className="table-secondary">ID: {record.id}</Text>
        </Space>
      ),
    },
    {
      title: 'Title / asset',
      key: 'title',
      render: (_, record) => {
        const assetId = record.asset?.id ?? record.assetId
        const asset = assets.find((item) => String(item.id) === String(assetId))

        return (
          <Space orientation="vertical" size={2}>
            <Text strong>{record.title}</Text>
            <Text type="secondary" className="table-secondary">
              {asset ? `${assetCode(asset)} · ${asset.assetType}` : assetCode(record.asset)}
            </Text>
          </Space>
        )
      },
    },
    {
      title: 'Technician',
      key: 'technician',
      render: (_, record) => {
        const technicianId = record.technician?.id ?? record.technicianId
        const technician = technicians.find(
          (item) => String(item.id) === String(technicianId)
        )
        return technician?.name ?? record.technician?.name ?? 'Unassigned'
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Tag color={priorityColor(priority)}>{readable(priority)}</Tag>,
    },
    {
      title: 'Scheduled',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: dateText,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{readable(status)}</Tag>,
    },
    {
      title: 'Update status',
      key: 'update',
      render: (_, record) => {
        const nextStatuses = allowedStatuses(record.status)

        if (!nextStatuses.length) {
          return <Text type="secondary" className="table-secondary">Final status</Text>
        }

        return (
          <Select
            size="small"
            className="status-update-select"
            placeholder={updatingOrderId === record.id ? 'Updating…' : 'Change status'}
            value={undefined}
            loading={updatingOrderId === record.id}
            disabled={updatingOrderId === record.id}
            options={nextStatuses.map((status) => ({
              value: status,
              label: readable(status),
            }))}
            onChange={(value) => handleStatusChange(record, value)}
          />
        )
      },
    },
  ]

  const assetColumns = [
    {
      title: 'Asset ID',
      dataIndex: 'assetId',
      key: 'assetId',
      render: (_, asset) => <Text strong>{assetCode(asset)}</Text>,
    },
    { title: 'Type', dataIndex: 'assetType', key: 'assetType' },
    {
      title: 'Manufacturer / model',
      key: 'manufacturerModel',
      render: (_, asset) =>
        [asset.manufacturer, asset.model].filter(Boolean).join(' / ') || '—',
    },
    { title: 'Serial number', dataIndex: 'serialNumber', key: 'serialNumber', render: (v) => v || '—' },
    { title: 'Usage hours', dataIndex: 'usageHours', key: 'usageHours', render: (v) => v ?? 0 },
    { title: 'Usage cycles', dataIndex: 'usageCycles', key: 'usageCycles', render: (v) => v ?? 0 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{readable(status)}</Tag>,
    },
  ]

  const technicianColumns = [
    {
      title: 'Technician',
      key: 'name',
      render: (_, technician) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{technician.name}</Text>
          <Text type="secondary" className="table-secondary">
            ID: {technician.id}
          </Text>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v) => v || '—' },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (v) => v || '—',
    },
    {
      title: 'Availability',
      dataIndex: 'available',
      key: 'available',
      render: (available) => (
        <Tag color={available ? 'success' : 'default'}>
          {available ? 'Available' : 'Unavailable'}
        </Tag>
      ),
    },
  ]

  const historyColumns = [
    {
      title: 'Work order',
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber',
      render: (value, record) => <Text strong>{value || `WO-${record.id}`}</Text>,
    },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Maintenance type',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      render: readable,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Tag color={priorityColor(priority)}>{readable(priority)}</Tag>,
    },
    {
      title: 'Scheduled',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: dateText,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{readable(status)}</Tag>,
    },
  ]

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'work-orders', icon: <FileTextOutlined />, label: 'Work Orders' },
    { key: 'assets', icon: <ToolOutlined />, label: 'Asset Management' },
    { key: 'technicians', icon: <TeamOutlined />, label: 'Technicians' },
    { key: 'history', icon: <HistoryOutlined />, label: 'Maintenance History' },
  ]

  function renderWorkOrdersTable() {
    return (
      <Card className="content-card" variant="borderless">
        <div className="section-toolbar">
          <div>
            <Title level={4}>Work orders</Title>
            <Text type="secondary">Monitor maintenance requests and update their status.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openWorkOrderModal}>
            Create work order
          </Button>
        </div>

        <div className="filter-toolbar">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'ALL', label: 'All statuses' },
              ...STATUS_OPTIONS,
            ]}
            className="filter-select"
            aria-label="Filter by status"
          />
          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'ALL', label: 'All priorities' },
              ...PRIORITY_OPTIONS,
            ]}
            className="filter-select"
            aria-label="Filter by priority"
          />
          <Select
            value={assetFilter}
            onChange={setAssetFilter}
            options={[
              { value: 'ALL', label: 'All assets' },
              ...assets.map((asset) => ({
                value: String(asset.id),
                label: assetCode(asset),
              })),
            ]}
            className="filter-select"
            aria-label="Filter by asset"
          />
          <Select
            value={technicianFilter}
            onChange={setTechnicianFilter}
            options={[
              { value: 'ALL', label: 'All technicians' },
              { value: '', label: 'Unassigned' },
              ...technicians.map((technician) => ({
                value: String(technician.id),
                label: technician.name,
              })),
            ]}
            className="filter-select"
            aria-label="Filter by technician"
          />
          <Button
            onClick={() => {
              setStatusFilter('ALL')
              setPriorityFilter('ALL')
              setAssetFilter('ALL')
              setTechnicianFilter('ALL')
            }}
          >
            Clear filters
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={workOrderColumns}
          dataSource={filteredWorkOrders}
          loading={loading}
          scroll={{ x: 1050 }}
          pagination={{ pageSize: 8, showSizeChanger: true }}
          locale={{ emptyText: <Empty description="No matching work orders" /> }}
        />
      </Card>
    )
  }

  function renderDashboard() {
    return (
      <>
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={12} lg={6}>
            <Card className="stat-card" variant="borderless">
              <Statistic title="Total work orders" value={stats.total} prefix={<FileTextOutlined />} />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card className="stat-card" variant="borderless">
              <Statistic title="Open" value={stats.open} styles={{ content: { color: '#d48806' } }} prefix={<ExclamationCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card className="stat-card" variant="borderless">
              <Statistic title="In progress" value={stats.inProgress} styles={{ content: { color: '#1677ff' } }} prefix={<ClockCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card className="stat-card" variant="borderless">
              <Statistic title="Completed" value={stats.completed} styles={{ content: { color: '#389e0d' } }} prefix={<CheckCircleOutlined />} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="overview-row">
          <Col xs={24} xl={16}>
            {renderWorkOrdersTable()}
          </Col>
          <Col xs={24} xl={8}>
            <Card className="content-card quick-card" variant="borderless">
              <Title level={4}>Quick actions</Title>
              <Paragraph type="secondary">
                Create a work order or manage the people and equipment responsible for maintenance.
              </Paragraph>
              <Space orientation="vertical" size="middle" className="quick-actions">
                <Button block type="primary" icon={<PlusOutlined />} onClick={openWorkOrderModal}>
                  Create work order
                </Button>
                <Button block icon={<ToolOutlined />} onClick={() => setActivePage('assets')}>
                  View assets ({assets.length})
                </Button>
                <Button block icon={<TeamOutlined />} onClick={() => setActivePage('technicians')}>
                  View technicians ({technicians.length})
                </Button>
                <Button block icon={<HistoryOutlined />} onClick={() => setActivePage('history')}>
                  View maintenance history
                </Button>
              </Space>
              <Descriptions
                className="overview-details"
                size="small"
                column={1}
                items={[
                  { key: 'assets', label: 'Registered assets', children: assets.length },
                  { key: 'technicians', label: 'Registered technicians', children: technicians.length },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </>
    )
  }

  function renderAssets() {
    return (
      <Card className="content-card" variant="borderless">
        <div className="section-toolbar">
          <div>
            <Title level={4}>Asset management</Title>
            <Text type="secondary">Register equipment and track asset status and usage.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAssetModal}>
            Register asset
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={assetColumns}
          dataSource={assets}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No assets registered yet" /> }}
        />
      </Card>
    )
  }

  function renderTechnicians() {
    return (
      <Card className="content-card" variant="borderless">
        <div className="section-toolbar">
          <div>
            <Title level={4}>Technician management</Title>
            <Text type="secondary">Manage technician contact details, specializations, and availability.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openTechnicianModal}>
            Register technician
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={technicianColumns}
          dataSource={technicians}
          loading={loading}
          scroll={{ x: 750 }}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No technicians registered yet" /> }}
        />
      </Card>
    )
  }

  function renderHistory() {
    return (
      <Card className="content-card" variant="borderless">
        <div className="section-toolbar">
          <div>
            <Title level={4}>Maintenance history</Title>
            <Text type="secondary">Choose an asset to see its related maintenance work orders.</Text>
          </div>
        </div>

        <div className="history-toolbar">
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Select an asset"
            value={selectedHistoryAsset}
            onChange={(value) => {
              setSelectedHistoryAsset(value)
              setHistoryLoaded(false)
              setMaintenanceHistory([])
            }}
            options={assets.map((asset) => ({
              value: asset.id,
              label: `${assetCode(asset)} — ${asset.assetType}`,
            }))}
            className="history-select"
          />
          <Button
            type="primary"
            icon={<HistoryOutlined />}
            onClick={handleLoadHistory}
            loading={loadingHistory}
          >
            Load history
          </Button>
        </div>

        {historyLoaded && (
          <Table
            rowKey="id"
            columns={historyColumns}
            dataSource={maintenanceHistory}
            scroll={{ x: 750 }}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: <Empty description="No maintenance history for this asset" /> }}
          />
        )}
      </Card>
    )
  }

  const pageTitles = {
    dashboard: ['Dashboard', 'Overview of maintenance operations'],
    'work-orders': ['Work Orders', 'Create, filter, and track maintenance work orders'],
    assets: ['Asset Management', 'Manage registered equipment and asset details'],
    technicians: ['Technicians', 'Manage your maintenance team'],
    history: ['Maintenance History', 'Review past work orders by asset'],
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2463eb',
          borderRadius: 10,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          colorBgLayout: '#f4f7fb',
        },
        components: {
          Layout: {
            bodyBg: '#f4f7fb',
            siderBg: '#111c32',
            headerBg: '#ffffff',
          },
          Menu: {
            darkItemBg: '#111c32',
            darkItemSelectedBg: '#2463eb',
            darkItemHoverBg: '#1b2b49',
            itemBorderRadius: 8,
          },
          Table: {
            headerBg: '#f7f9fc',
            rowHoverBg: '#f8faff',
          },
        },
      }}
    >
      {messageContextHolder}

      <Layout className="app-layout">
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          width={245}
          className="app-sider"
        >
          <div className="sidebar-brand">
            <div className="sidebar-logo">M</div>
            <div>
              <div className="sidebar-title">Maintena</div>
              <div className="sidebar-subtitle">OPERATIONS PORTAL</div>
            </div>
          </div>

          <div className="sidebar-section-label">WORKSPACE</div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activePage]}
            items={menuItems}
            onClick={({ key }) => setActivePage(key)}
            className="sidebar-menu"
          />

          <div className="sidebar-bottom">
            <div className="sidebar-status-dot" />
            <div>
              <div className="sidebar-bottom-title">System workspace</div>
              <div className="sidebar-bottom-caption">Maintenance operations</div>
            </div>
          </div>
        </Sider>

        <Layout className="main-layout">
          <Header className="app-header">
            <div>
              <Text className="header-overline">MAINTENANCE MANAGEMENT</Text>
              <Title level={4} className="header-title">
                {pageTitles[activePage]?.[0] || 'Dashboard'}
              </Title>
            </div>
            <Space>
              <Tooltip title="Refresh data">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => loadData(true)}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Tooltip>
              <Button type="primary" icon={<PlusOutlined />} onClick={openWorkOrderModal}>
                New work order
              </Button>
            </Space>
          </Header>

          <Content className="app-content">
            <div className="page-intro">
              <div>
                <Title level={3}>{pageTitles[activePage]?.[0] || 'Dashboard'}</Title>
                <Text type="secondary">
                  {pageTitles[activePage]?.[1] || 'Overview of maintenance operations'}
                </Text>
              </div>
              <Tag color="blue">Maintenance workspace</Tag>
            </div>

            {pageError && (
              <Alert
                type="error"
                showIcon
                closable
                message="Could not load application data"
                description={pageError}
                className="page-alert"
                onClose={() => setPageError('')}
              />
            )}

            {loading && assets.length === 0 && technicians.length === 0 && workOrders.length === 0 && !pageError ? (
              <div className="loading-state"><Spin size="large" description="Loading maintenance data..." /></div>
            ) : (
              <>
                {activePage === 'dashboard' && renderDashboard()}
                {activePage === 'work-orders' && renderWorkOrdersTable()}
                {activePage === 'assets' && renderAssets()}
                {activePage === 'technicians' && renderTechnicians()}
                {activePage === 'history' && renderHistory()}
              </>
            )}

            <footer className="app-footer">
              <Text type="secondary">Maintenance Work Order Management</Text>
              <Text type="secondary">React · Ant Design · Spring Boot · PostgreSQL</Text>
            </footer>
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Create work order"
        open={workOrderModalOpen}
        onCancel={() => setWorkOrderModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={720}
      >
        <Form
          form={workOrderForm}
          layout="vertical"
          onFinish={handleCreateWorkOrder}
          requiredMark="optional"
          initialValues={{
            priority: 'MEDIUM',
            maintenanceType: 'PREVENTIVE',
            scheduledDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Work order number"
                name="workOrderNumber"
                rules={[{ required: true, message: 'Enter a work order number' }]}
              >
                <Input placeholder="e.g. WO-1003" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Enter a title' }]}
              >
                <Input placeholder="e.g. Generator inspection" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Asset"
                name="assetId"
                rules={[{ required: true, message: 'Select an asset' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select asset"
                  options={assets.map((asset) => ({
                    value: asset.id,
                    label: `${assetCode(asset)} — ${asset.assetType}`,
                    disabled: asset.status === 'OUT_OF_SERVICE',
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Assign technician" name="technicianId">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select technician"
                  options={technicians.map((technician) => ({
                    value: technician.id,
                    label: technician.name,
                    disabled: technician.available === false,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: 'Select a priority' }]}
              >
                <Select options={PRIORITY_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Maintenance type"
                name="maintenanceType"
                rules={[{ required: true, message: 'Select a maintenance type' }]}
              >
                <Select options={MAINTENANCE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Scheduled date"
                name="scheduledDate"
                rules={[{ required: true, message: 'Select a date' }]}
              >
                <DatePicker
                  className="full-control"
                  minDate={dayjs().startOf('day')}
                  format="DD MMM YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} placeholder="Describe the maintenance required" />
              </Form.Item>
            </Col>
          </Row>
          <div className="modal-actions">
            <Button onClick={() => setWorkOrderModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={savingWorkOrder}>
              Create work order
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Register asset"
        open={assetModalOpen}
        onCancel={() => setAssetModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={680}
      >
        <Form
          form={assetForm}
          layout="vertical"
          onFinish={handleCreateAsset}
          initialValues={{ status: 'ACTIVE', usageHours: 0, usageCycles: 0 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Asset ID / code"
                name="assetId"
                rules={[{ required: true, message: 'Enter an asset code' }]}
              >
                <Input placeholder="e.g. AST-1025" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Asset type"
                name="assetType"
                rules={[{ required: true, message: 'Enter an asset type' }]}
              >
                <Input placeholder="e.g. Generator" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Manufacturer" name="manufacturer">
                <Input placeholder="e.g. Siemens" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Model" name="model">
                <Input placeholder="Model name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Serial number" name="serialNumber">
                <Input placeholder="Serial number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'OUT_OF_SERVICE', label: 'Out of service' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Usage hours" name="usageHours">
                <InputNumber min={0} step={0.01} className="full-control" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Usage cycles" name="usageCycles">
                <InputNumber min={0} step={1} className="full-control" />
              </Form.Item>
            </Col>
          </Row>
          <div className="modal-actions">
            <Button onClick={() => setAssetModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={savingAsset}>
              Register asset
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Register technician"
        open={technicianModalOpen}
        onCancel={() => setTechnicianModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={620}
      >
        <Form
          form={technicianForm}
          layout="vertical"
          onFinish={handleCreateTechnician}
          initialValues={{ available: true }}
        >
          <Form.Item
            label="Full name"
            name="name"
            rules={[{ required: true, message: 'Enter the technician name' }]}
          >
            <Input placeholder="e.g. Priya Patel" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Enter an email address' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input placeholder="technician@example.com" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Specialization"
                name="specialization"
                rules={[{ required: true, message: 'Enter a specialization' }]}
              >
                <Input placeholder="e.g. Electrical" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="available" valuePropName="checked">
            <Checkbox>Technician is available for assignment</Checkbox>
          </Form.Item>
          <div className="modal-actions">
            <Button onClick={() => setTechnicianModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={savingTechnician}>
              Register technician
            </Button>
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  )
}



export default App
