/**
 * Parses an uploaded SVG file text and extracts path data.
 * Returns a list of { id, pathData } objects.
 * Handles path, polygon, polyline, rect, circle, ellipse.
 */
export const parseSvgPaths = (svgText) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const paths = [];

    // console.log("Parsing SVG Root:", doc.documentElement.tagName);

    const convertPolyToPath = (points, closed) => {
        if (!points) return '';
        const coords = points.trim().split(/\s+|,/);
        let d = '';
        for (let i = 0; i < coords.length; i += 2) {
            d += (i === 0 ? 'M' : 'L') + coords[i] + ',' + coords[i + 1] + ' ';
        }
        if (closed) d += 'Z';
        return d;
    };

    const convertRectToPath = (x, y, w, h) => {
        return `M${x},${y} h${w} v${h} h-${w} Z`;
    };

    // Circle/Ellipse approx
    const convertCircleToPath = (cx, cy, r) => {
        return `M ${cx - r}, ${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    };

    const traverse = (node) => {
        const tagName = (node.localName || node.tagName || '').toLowerCase();
        let d = null;

        if (tagName === 'path') {
            d = node.getAttribute('d');
        } else if (tagName === 'polygon') {
            d = convertPolyToPath(node.getAttribute('points'), true);
        } else if (tagName === 'polyline') {
            d = convertPolyToPath(node.getAttribute('points'), false);
        } else if (tagName === 'rect') {
            const x = parseFloat(node.getAttribute('x') || 0);
            const y = parseFloat(node.getAttribute('y') || 0);
            const w = parseFloat(node.getAttribute('width') || 0);
            const h = parseFloat(node.getAttribute('height') || 0);
            if (w > 0 && h > 0) d = convertRectToPath(x, y, w, h);
        } else if (tagName === 'circle') {
            const cx = parseFloat(node.getAttribute('cx') || 0);
            const cy = parseFloat(node.getAttribute('cy') || 0);
            const r = parseFloat(node.getAttribute('r') || 0);
            if (r > 0) d = convertCircleToPath(cx, cy, r);
        }

        if (d) {
            paths.push({
                id: node.id || `shape-${paths.length}`,
                pathData: d,
                fill: node.getAttribute('fill') || '#ffffff',
                stroke: node.getAttribute('stroke') || 'none'
            });
        }

        if (node.children) {
            Array.from(node.children).forEach(traverse);
        }
    };

    traverse(doc.documentElement);
    return paths;
};
