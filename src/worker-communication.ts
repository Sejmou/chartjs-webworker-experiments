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

export type WorkerMessage = RenderCanvasMessage | ResizeCanvasMessage;

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
