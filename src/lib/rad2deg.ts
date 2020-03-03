
export default function rad2deg(rad) {
    var deg = rad * 180 / Math.PI;
    return Number(deg.toFixed(3));
}