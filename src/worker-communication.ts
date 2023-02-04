export type RenderCanvasMessage = {
  type: 'create-canvas';
  canvas: OffscreenCanvas;
  chartConfig: any; // TODO: figure out how to type this
  width: number;
  height: number;
};

export type ResizeCanvasMessage = {
  type: 'resize-canvas';
  width: number;
  height: number;
};

export type CanvasClickMessage = {
  type: 'canvas-click';
  x: number;
  y: number;
};

export type CanvasHoverMessage = {
  type: 'canvas-hover';
  x: number;
  y: number;
};

export type WorkerMessage =
  | RenderCanvasMessage
  | ResizeCanvasMessage
  | CanvasClickMessage
  | CanvasHoverMessage;

export const isRenderCanvasMessage = (
  message: WorkerMessage
): message is RenderCanvasMessage => {
  return message.type === 'create-canvas';
};

export const isResizeCanvasMessage = (
  message: WorkerMessage
): message is ResizeCanvasMessage => {
  return message.type === 'resize-canvas';
};

export const isCanvasClickMessage = (
  message: WorkerMessage
): message is CanvasClickMessage => {
  return message.type === 'canvas-click';
};

export const isCanvasHoverMessage = (
  message: WorkerMessage
): message is CanvasHoverMessage => {
  return message.type === 'canvas-hover';
};

export const sendRenderCanvasMessage = (
  payload: Omit<RenderCanvasMessage, 'type'>,
  worker: Worker
) => {
  const message = {
    type: 'create-canvas',
    ...payload,
  };
  worker.postMessage(message, [message.canvas]);
};

export const sendResizeCanvasMessage = (
  payload: Omit<ResizeCanvasMessage, 'type'>,
  worker: Worker
) => {
  const message = {
    type: 'resize-canvas',
    ...payload,
  };
  worker.postMessage(message);
};

export const sendCanvasClickMessage = (
  payload: Omit<CanvasClickMessage, 'type'>,
  worker: Worker
) => {
  const message = {
    type: 'canvas-click',
    ...payload,
  };
  worker.postMessage(message);
};

export const sendCanvasHoverMessage = (
  payload: Omit<CanvasHoverMessage, 'type'>,
  worker: Worker
) => {
  const message = {
    type: 'canvas-hover',
    ...payload,
  };
  worker.postMessage(message);
};
