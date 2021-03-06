var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * @module ol/renderer/canvas/ImageLayer
 */
import { ENABLE_RASTER_REPROJECTION } from '../../reproj/common.js';
import ViewHint from '../../ViewHint.js';
import { containsExtent, intersects } from '../../extent.js';
import { fromUserExtent } from '../../proj.js';
import { getIntersection, isEmpty } from '../../extent.js';
import CanvasLayerRenderer from './Layer.js';
import { compose as composeTransform, makeInverse } from '../../transform.js';
/**
 * @classdesc
 * Canvas renderer for image layers.
 * @api
 */
var CanvasImageLayerRenderer = /** @class */ (function (_super) {
    __extends(CanvasImageLayerRenderer, _super);
    /**
     * @param {import("../../layer/Image.js").default} imageLayer Image layer.
     */
    function CanvasImageLayerRenderer(imageLayer) {
        var _this = _super.call(this, imageLayer) || this;
        /**
         * @protected
         * @type {?import("../../ImageBase.js").default}
         */
        _this.image_ = null;
        return _this;
    }
    /**
     * @inheritDoc
     */
    CanvasImageLayerRenderer.prototype.getImage = function () {
        return !this.image_ ? null : this.image_.getImage();
    };
    /**
     * @inheritDoc
     */
    CanvasImageLayerRenderer.prototype.prepareFrame = function (frameState) {
        var layerState = frameState.layerStatesArray[frameState.layerIndex];
        var pixelRatio = frameState.pixelRatio;
        var viewState = frameState.viewState;
        var viewResolution = viewState.resolution;
        var imageSource = this.getLayer().getSource();
        var hints = frameState.viewHints;
        var renderedExtent = frameState.extent;
        if (layerState.extent !== undefined) {
            renderedExtent = getIntersection(renderedExtent, fromUserExtent(layerState.extent, viewState.projection));
        }
        if (!hints[ViewHint.ANIMATING] && !hints[ViewHint.INTERACTING] && !isEmpty(renderedExtent)) {
            var projection = viewState.projection;
            if (!ENABLE_RASTER_REPROJECTION) {
                var sourceProjection = imageSource.getProjection();
                if (sourceProjection) {
                    projection = sourceProjection;
                }
            }
            var image = imageSource.getImage(renderedExtent, viewResolution, pixelRatio, projection);
            if (image && this.loadImage(image)) {
                this.image_ = image;
            }
        }
        return !!this.image_;
    };
    /**
     * @inheritDoc
     */
    CanvasImageLayerRenderer.prototype.renderFrame = function (frameState, target) {
        var image = this.image_;
        var imageExtent = image.getExtent();
        var imageResolution = image.getResolution();
        var imagePixelRatio = image.getPixelRatio();
        var layerState = frameState.layerStatesArray[frameState.layerIndex];
        var pixelRatio = frameState.pixelRatio;
        var viewState = frameState.viewState;
        var viewCenter = viewState.center;
        var viewResolution = viewState.resolution;
        var size = frameState.size;
        var scale = pixelRatio * imageResolution / (viewResolution * imagePixelRatio);
        var width = Math.round(size[0] * pixelRatio);
        var height = Math.round(size[1] * pixelRatio);
        var rotation = viewState.rotation;
        if (rotation) {
            var size_1 = Math.round(Math.sqrt(width * width + height * height));
            width = size_1;
            height = size_1;
        }
        // set forward and inverse pixel transforms
        composeTransform(this.pixelTransform, frameState.size[0] / 2, frameState.size[1] / 2, 1 / pixelRatio, 1 / pixelRatio, rotation, -width / 2, -height / 2);
        makeInverse(this.inversePixelTransform, this.pixelTransform);
        var canvasTransform = this.createTransformString(this.pixelTransform);
        this.useContainer(target, canvasTransform, layerState.opacity);
        var context = this.context;
        var canvas = context.canvas;
        if (canvas.width != width || canvas.height != height) {
            canvas.width = width;
            canvas.height = height;
        }
        else if (!this.containerReused) {
            context.clearRect(0, 0, width, height);
        }
        // clipped rendering if layer extent is set
        var clipped = false;
        if (layerState.extent) {
            var layerExtent = fromUserExtent(layerState.extent, viewState.projection);
            clipped = !containsExtent(layerExtent, frameState.extent) && intersects(layerExtent, frameState.extent);
            if (clipped) {
                this.clipUnrotated(context, frameState, layerExtent);
            }
        }
        var img = image.getImage();
        var transform = composeTransform(this.tempTransform_, width / 2, height / 2, scale, scale, 0, imagePixelRatio * (imageExtent[0] - viewCenter[0]) / imageResolution, imagePixelRatio * (viewCenter[1] - imageExtent[3]) / imageResolution);
        this.renderedResolution = imageResolution * pixelRatio / imagePixelRatio;
        var dx = transform[4];
        var dy = transform[5];
        var dw = img.width * transform[0];
        var dh = img.height * transform[3];
        this.preRender(context, frameState);
        if (dw >= 0.5 && dh >= 0.5) {
            var opacity = layerState.opacity;
            var previousAlpha = void 0;
            if (opacity !== 1) {
                previousAlpha = this.context.globalAlpha;
                this.context.globalAlpha = opacity;
            }
            this.context.drawImage(img, 0, 0, +img.width, +img.height, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
            if (opacity !== 1) {
                this.context.globalAlpha = previousAlpha;
            }
        }
        this.postRender(context, frameState);
        if (clipped) {
            context.restore();
        }
        if (canvasTransform !== canvas.style.transform) {
            canvas.style.transform = canvasTransform;
        }
        return this.container;
    };
    return CanvasImageLayerRenderer;
}(CanvasLayerRenderer));
export default CanvasImageLayerRenderer;
//# sourceMappingURL=ImageLayer.js.map