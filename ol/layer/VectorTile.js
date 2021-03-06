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
 * @module ol/layer/VectorTile
 */
import { assert } from '../asserts.js';
import TileProperty from './TileProperty.js';
import BaseVectorLayer from './BaseVector.js';
import VectorTileRenderType from './VectorTileRenderType.js';
import CanvasVectorTileLayerRenderer from '../renderer/canvas/VectorTileLayer.js';
import { assign } from '../obj.js';
/**
 * @typedef {Object} Options
 * @property {string} [className='ol-layer'] A CSS class name to set to the layer element.
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
 * rendered outside of this extent.
 * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
 * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
 * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
 * method was used.
 * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
 * visible.
 * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
 * be visible.
 * @property {import("../render.js").OrderFunction} [renderOrder] Render order. Function to be used when sorting
 * features before rendering. By default features are drawn in the order that they are created. Use
 * `null` to avoid the sort, but get an undefined draw order.
 * @property {number} [renderBuffer=100] The buffer in pixels around the tile extent used by the
 * renderer when getting features from the vector tile for the rendering or hit-detection.
 * Recommended value: Vector tiles are usually generated with a buffer, so this value should match
 * the largest possible buffer of the used tiles. It should be at least the size of the largest
 * point symbol or line width.
 * @property {import("./VectorTileRenderType.js").default|string} [renderMode='hybrid'] Render mode for vector tiles:
 *  * `'image'`: Vector tiles are rendered as images. Great performance, but point symbols and texts
 *    are always rotated with the view and pixels are scaled during zoom animations. When `declutter`
 *    is set to `true`, the decluttering is done per tile resulting in labels and point symbols getting
 *    cut off at tile boundaries.
 *  * `'hybrid'`: Polygon and line elements are rendered as images, so pixels are scaled during zoom
 *    animations. Point symbols and texts are accurately rendered as vectors and can stay upright on
 *    rotated views.
 *  * `'vector'`: Everything is rendered as vectors. Use this mode for improved performance on vector
 *    tile layers with only a few rendered features (e.g. for highlighting a subset of features of
 *    another layer with the same source).
 * @property {import("../source/VectorTile.js").default} [source] Source.
 * @property {import("../PluggableMap.js").default} [map] Sets the layer as overlay on a map. The map will not manage
 * this layer in its layers collection, and the layer will be rendered on top. This is useful for
 * temporary layers. The standard way to add a layer to a map and have it managed by the map is to
 * use {@link module:ol/Map#addLayer}.
 * @property {boolean} [declutter=false] Declutter images and text. Decluttering is applied to all
 * image and text styles of all Vector and VectorTile layers that have set this to `true`. The priority
 * is defined by the z-index of the layer, the `zIndex` of the style and the render order of features.
 * Higher z-index means higher priority. Within the same z-index, a feature rendered before another has
 * higher priority.
 * @property {import("../style/Style.js").StyleLike} [style] Layer style. See
 * {@link module:ol/style} for default style which will be used if this is not defined.
 * @property {boolean} [updateWhileAnimating=false] When set to `true`, feature batches will be
 * recreated during animations. This means that no vectors will be shown clipped, but the setting
 * will have a performance impact for large amounts of vector data. When set to `false`, batches
 * will be recreated when no animation is active.
 * @property {boolean} [updateWhileInteracting=false] When set to `true`, feature batches will be
 * recreated during interactions. See also `updateWhileAnimating`.
 * @property {number} [preload=0] Preload. Load low-resolution tiles up to `preload` levels. `0`
 * means no preloading.
 * @property {boolean} [useInterimTilesOnError=true] Use interim tiles on error.
 */
/**
 * @classdesc
 * Layer for vector tile data that is rendered client-side.
 * Note that any property set in the options is set as a {@link module:ol/Object~BaseObject}
 * property on the layer object; for example, setting `title: 'My Title'` in the
 * options means that `title` is observable, and has get/set accessors.
 *
 * @param {Options=} opt_options Options.
 * @extends {BaseVectorLayer<import("../source/VectorTile.js").default>}
 * @api
 */
var VectorTileLayer = /** @class */ (function (_super) {
    __extends(VectorTileLayer, _super);
    /**
     * @param {Options=} opt_options Options.
     */
    function VectorTileLayer(opt_options) {
        var _this = this;
        var options = opt_options ? opt_options : {};
        var baseOptions = /** @type {Object} */ (assign({}, options));
        delete baseOptions.preload;
        delete baseOptions.useInterimTilesOnError;
        _this = _super.call(this, /** @type {import("./BaseVector.js").Options} */ (baseOptions)) || this;
        var renderMode = options.renderMode || VectorTileRenderType.HYBRID;
        assert(renderMode == undefined ||
            renderMode == VectorTileRenderType.IMAGE ||
            renderMode == VectorTileRenderType.HYBRID ||
            renderMode == VectorTileRenderType.VECTOR, 28); // `renderMode` must be `'image'`, `'hybrid'` or `'vector'`.
        /**
         * @private
         * @type {VectorTileRenderType}
         */
        _this.renderMode_ = renderMode;
        _this.setPreload(options.preload ? options.preload : 0);
        _this.setUseInterimTilesOnError(options.useInterimTilesOnError !== undefined ?
            options.useInterimTilesOnError : true);
        return _this;
    }
    /**
     * Create a renderer for this layer.
     * @return {import("../renderer/Layer.js").default} A layer renderer.
     * @protected
     */
    VectorTileLayer.prototype.createRenderer = function () {
        return new CanvasVectorTileLayerRenderer(this);
    };
    /**
     * Get the topmost feature that intersects the given pixel on the viewport. Returns a promise
     * that resolves with an array of features. The array will either contain the topmost feature
     * when a hit was detected, or it will be empty.
     *
     * The hit detection algorithm used for this method is optimized for performance, but is less
     * accurate than the one used in {@link import("../PluggableMap.js").default#getFeaturesAtPixel}: Text
     * is not considered, and icons are only represented by their bounding box instead of the exact
     * image.
     *
     * @param {import("../pixel.js").Pixel} pixel Pixel.
     * @return {Promise<Array<import("../Feature").default>>} Promise that resolves with an array of features.
     * @api
     */
    VectorTileLayer.prototype.getFeatures = function (pixel) {
        return _super.prototype.getFeatures.call(this, pixel);
    };
    /**
     * @return {VectorTileRenderType} The render mode.
     */
    VectorTileLayer.prototype.getRenderMode = function () {
        return this.renderMode_;
    };
    /**
     * Return the level as number to which we will preload tiles up to.
     * @return {number} The level to preload tiles up to.
     * @observable
     * @api
     */
    VectorTileLayer.prototype.getPreload = function () {
        return /** @type {number} */ (this.get(TileProperty.PRELOAD));
    };
    /**
     * Whether we use interim tiles on error.
     * @return {boolean} Use interim tiles on error.
     * @observable
     * @api
     */
    VectorTileLayer.prototype.getUseInterimTilesOnError = function () {
        return /** @type {boolean} */ (this.get(TileProperty.USE_INTERIM_TILES_ON_ERROR));
    };
    /**
     * Set the level as number to which we will preload tiles up to.
     * @param {number} preload The level to preload tiles up to.
     * @observable
     * @api
     */
    VectorTileLayer.prototype.setPreload = function (preload) {
        this.set(TileProperty.PRELOAD, preload);
    };
    /**
     * Set whether we use interim tiles on error.
     * @param {boolean} useInterimTilesOnError Use interim tiles on error.
     * @observable
     * @api
     */
    VectorTileLayer.prototype.setUseInterimTilesOnError = function (useInterimTilesOnError) {
        this.set(TileProperty.USE_INTERIM_TILES_ON_ERROR, useInterimTilesOnError);
    };
    return VectorTileLayer;
}(BaseVectorLayer));
export default VectorTileLayer;
//# sourceMappingURL=VectorTile.js.map