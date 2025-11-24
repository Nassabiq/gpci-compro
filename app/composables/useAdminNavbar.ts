// composables/useAdminNav.ts
import {LayoutDashboard, Package, Boxes, Tags, Users as UsersIcon, FileText, BadgeCheck, ShieldCheck, Shield, KeyRound} from "lucide-vue-next";

export interface AdminNavItem {
	label: string;
	to?: string;
	icon?: any;
	permission?: string;
	children?: AdminNavItem[];
}

export const useAdminNav = (): AdminNavItem[] => [
	{
		label: "Dashboard",
		to: "/admin",
		icon: LayoutDashboard,
	},
	{
		label: "Manajemen Konten",
		icon: FileText,
		children: [
			{label: "Event", to: "/admin/products/categories"},
			{label: "Artikel", to: "/admin/products/categories"},
			{label: "FAQ", to: "/admin/products/categories"},
		],
	},
	{
		label: "Manajemen Site",
		icon: FileText,
		children: [{label: "Milestone", to: "/admin/products/categories"}],
	},
	{
		label: "Sertifikasi GLI",
		icon: BadgeCheck,
		children: [
			{label: "Sertifikasi", to: "/admin/gli-certificate", permission: "product.certifications.read"},
			{label: "Kategori", to: "/admin/products/categories", permission: "brand.categories.read"},
		],
	},
	{
		label: "Sertifikasi GTRI",
		icon: ShieldCheck,
		children: [
			{label: "Sertifikasi", to: "/admin/products", permission: "products.read"},
			{label: "Kategori", to: "/admin/products/categories", permission: "brand.categories.read"},
		],
	},
	{
		label: "Access Control",
		icon: UsersIcon,
		children: [
			{label: "Users", to: "/admin/users", permission: "users.read"},
			{label: "Roles", to: "/admin/roles", permission: "rbac.roles.read"},
			{label: "Permissions", to: "/admin/permissions", permission: "rbac.permissions.read"},
		],
	},
];
