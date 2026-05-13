import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

export interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    title?: string;
    [key: string]: any;
}

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta'> {
    meta?: RouteMeta;
}