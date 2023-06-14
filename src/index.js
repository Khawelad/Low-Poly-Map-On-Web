import Delaunator from 'delaunator';
import PoissonDiskSampling from 'poisson-disk-sampling';
import Perlin from 'perlin.js';
Perlin.seed(Math.random());

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let points = [];
const noiseMap = [];
const vertices = [];

ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
ctx.translate(-250, -250);

const pds = new PoissonDiskSampling({
  shape: [window.innerWidth + 500, window.innerHeight + 500],
  minDistance: 7,
  maxDistance: 10,
  tries: 30
});

const candidatePoints = pds.fill();
candidatePoints.forEach(point => {
  const [x, z] = point;
  points.push(x, z);
  vertices.push({ x, z });
});

const delaunay = new Delaunator(points);

generateNoiseMap();

for (let i = 0; i < delaunay.triangles.length; i += 3) {
  const pt1 = delaunay.triangles[i];
  const pt2 = delaunay.triangles[i + 1];
  const pt3 = delaunay.triangles[i + 2];

  const averageHeight = (noiseMap[pt1] + noiseMap[pt2] + noiseMap[pt3]) / 3;
  let fillColor = "#fefefe"; // Snow

  if (averageHeight < -2.7) {
    fillColor = "#fefefe"; // Snow
  } else if (averageHeight < -1.6) {
    fillColor = "#495057"; // Mountains
  } else if (averageHeight < -0.8) {
    fillColor = "#59b300"; // Deep Grass
  } else if (averageHeight < -0.3) {
    fillColor = "#70e000"; // Grass
  } else if (averageHeight < 0) {
    fillColor = "#00b4d8"; // Water
  } else if (averageHeight < 1) {
    fillColor = "#0077b6"; // Deep Water
  }

  const x1 = delaunay.coords[2 * pt1];
  const y1 = delaunay.coords[2 * pt1 + 1];
  const x2 = delaunay.coords[2 * pt2];
  const y2 = delaunay.coords[2 * pt2 + 1];
  const x3 = delaunay.coords[2 * pt3];
  const y3 = delaunay.coords[2 * pt3 + 1];

  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function generateNoiseMap() {
  const scale = 50;
  let amplitude = 1;
  let frequency = 1;
  let MaxPossibleHeight = 0;
  const persistance = 0.1;
  const lacunarity = 0.3;
  const octavesOffset = new Array(8).fill(0).map(() => [
    Math.floor(Math.random() * 1000000),
    Math.floor(Math.random() * 1000000)
  ]);

  for (let j = 0; j < vertices.length; j++) {
    amplitude = 1;
    frequency = 1;
    let noiseHeight = 0;

    for (let i = 0; i < 8; i++) {
      const sampleX = (vertices[j].x + octavesOffset[i][0]) / scale * frequency;
      const sampleZ = (vertices[j].z + octavesOffset[i][1]) / scale * frequency;

      const perlinValue = Perlin.perlin2(sampleX, sampleZ) * 2 - 1;
      noiseHeight += perlinValue * amplitude;

      amplitude *= persistance;
      frequency *= lacunarity;
    }

    noiseMap[j] = noiseHeight;
  }
}