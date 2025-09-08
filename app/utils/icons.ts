import * as icons from "lucide-vue-next";
import type {Component} from "vue";
export const iconByName = (name?: string): Component => (icons as any)[name || ""] ?? (icons as any).CheckCircle;
