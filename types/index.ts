export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  branchId?: string
  brandId?: string
}

export interface Menu {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isAvailable: boolean
  isBestSeller: boolean
  toppings: Topping[]
  branchId: string
  createdAt: string
  updatedAt: string
}

export interface Topping {
  id: string
  name: string
  price: number
  isAvailable: boolean
}

export interface CartItem {
  menuId: string
  name: string
  price: number
  quantity: number
  toppings: SelectedTopping[]
  subtotal: number
}

export interface SelectedTopping {
  toppingId: string
  name: string
  price: number
}

export interface Order {
  id: string
  tableNumber: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentMethod: 'CASH' | 'QRIS'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
  createdAt: string
  updatedAt: string
  customerNote?: string
}

export interface OrderItem {
  menuId: string
  menuName: string
  quantity: number
  price: number
  toppings: SelectedTopping[]
  subtotal: number
}

export type OrderStatus = 
  | 'pending' 
  | 'preparing' 
  | 'ready' 
  | 'serving' 
  | 'completed' 
  | 'cancelled'

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  isActive: boolean
  tables: Table[]
}

export interface Table {
  id: string
  number: string
  qrCode: string
  isActive: boolean
  branchId: string
}

export interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topProducts: { name: string; count: number; revenue: number }[]
  dailySales: { date: string; revenue: number; orders: number }[]
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown>
  timestamp: string
  ipAddress?: string
}
export interface CreateMenuDto {
  name: string
  description: string
  price: number
  category: string
  image?: string         // opsional karena bisa saja belum upload foto
  isAvailable: boolean
  isBestSeller: boolean
  toppingIds: string[]   // backend biasanya menerima array ID string untuk topping
  branchId: string       // ID cabang tempat menu ini dibuat
}


export type UpdateMenuDto = Partial<CreateMenuDto>