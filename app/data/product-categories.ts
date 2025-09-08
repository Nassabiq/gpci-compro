// data/products.ts
export type ProductCategoriesCard = {
	id: string;
	image: string;
	category: string;
	title: string;
	count: string | number;
	description: string;
};

export const ALL_PRODUCT_CATEGORIES: ProductCategoriesCard[] = [
	{
		id: "1",
		image: "/img/product-categories/building-material.jpg",
		category: "Building Materials",
		title: "Building Materials",
		count: "A+",
		description: "Sustainable construction materials that meet the highest environmental standards.",
	},
	{
		id: "2",
		image: "/img/product-categories/interior-products.jpg",
		category: "Interior Products",
		title: "Interior Products",
		count: "A+",
		description: "Eco-friendly interior solutions for modern sustainable living spaces.",
	},
	{
		id: "3",
		image: "/img/product-categories/cleaning-products.jpg",
		category: "Cleaning Products",
		title: "Cleaning Products",
		count: "A+",
		description: "Green cleaning solutions that protect both your health and the environment.",
	},
];
