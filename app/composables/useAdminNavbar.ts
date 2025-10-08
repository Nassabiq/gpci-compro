// composables/useAdminNav.ts
import {LayoutDashboard, Package, Boxes, Tags, Users as UsersIcon, FileText, BadgeCheck, ShieldCheck, Shield, KeyRound} from "lucide-vue-next";

export const useAdminNav = () => [
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
			{label: "Sertifikasi", to: "/admin/gli-certificate"},
			{label: "Kategori", to: "/admin/products/categories"},
		],
	},
	{
		label: "Sertifikasi GTRI",
		icon: ShieldCheck,
		children: [
			{label: "Sertifikasi", to: "/admin/products"},
			{label: "Kategori", to: "/admin/products/categories"},
		],
	},
	{
		label: "Access Control",
		icon: UsersIcon,
		children: [
			{label: "Users", to: "/admin/users"},
			{label: "Roles", to: "/admin/roles"},
			{label: "Permissions", to: "/admin/permissions"},
		],
	},
];
