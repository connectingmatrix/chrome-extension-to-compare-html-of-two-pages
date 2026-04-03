import { PageAction } from '@/src/shared/page-action';

export interface PageOpenItem {
    height?: number;
    role?: string;
    url: string;
    width?: number;
}

export interface LivePage {
    height: number;
    instanceId: string;
    pageId: string;
    recordingIds: string[];
    role: string;
    sessionId: string;
    status: string;
    tabId?: number;
    title: string;
    url: string;
    width: number;
}

export interface OpenPagesPayload {
    actions?: PageAction[];
    pages: PageOpenItem[];
    snapshot?: boolean;
}

export interface PageActionsPayload {
    actions: PageAction[];
}

export interface PageClosePayload {
    pageId: string;
}

export interface PageDataPayload {
    pageId: string;
    path?: string;
    selector: string;
    snapshot?: boolean;
}

export interface PageDiffPayload {
    leftPageId: string;
    path?: string;
    rightPageId: string;
    selector: string;
    snapshot?: boolean;
}

export interface PageHtmlPayload {
    pageId: string;
    selector?: string;
}

export interface PageScreenshotPayload {
    fullPage?: boolean;
    pageId: string;
    selector?: string;
}
