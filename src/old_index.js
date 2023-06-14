import Delaunator from 'delaunator';
import PoissonDiskSampling from 'poisson-disk-sampling';
import Perlin from 'perlin.js';
Perlin.seed(Math.random());

const CanvasElement = document.getElementById("canvas"),
CTX = CanvasElement.getContext("2d");

CTX.canvas.width = window.innerWidth;
CTX.canvas.height = window.innerHeight;

let Points = [];

CTX.fillRect(0, 0, window.innerWidth, window.innerHeight);
CTX.translate(-250, -250);

var PDS = new PoissonDiskSampling({
    shape: [window.innerWidth + 500, window.innerHeight + 500],
    minDistance: 7,
    maxDistance: 10,
    tries: 30
});

var CandidatePoints = PDS.fill();
let Vertices = [];
for (let i = 0; i < CandidatePoints.length; i++) {
    Points.push(CandidatePoints[i][0]);
    Points.push(CandidatePoints[i][1]);
    const Vertice = {
        x: CandidatePoints[i][0],
        z: CandidatePoints[i][1]
    }
    Vertices.push(Vertice);
}

const Delaunay = new Delaunator(Points);

let NoiseMap = [];
GenerateNoiseMap();

for (let i = 0; i < Delaunay.triangles.length; i += 3) {
    CTX.fillStyle = "red";
    const pt1 = Delaunay.triangles[i];
    const pt2 = Delaunay.triangles[i + 1];
    const pt3 = Delaunay.triangles[i + 2];

    let AverageHeight = (NoiseMap[pt1] + NoiseMap[pt2] + NoiseMap[pt3]) / 3;
    if (AverageHeight < -2.7) {
        CTX.fillStyle = "#fefefe" // Snow
    } else if (AverageHeight < -1.6) {
        CTX.fillStyle = "#495057"; //Mountains
    } else if (AverageHeight < -0.8) {
        CTX.fillStyle = "#59b300" // Deep Grass
    } else if (AverageHeight < -0.3) {
        CTX.fillStyle = "#70e000" // Grass
    } else if (AverageHeight < 0) {
        CTX.fillStyle = "#00b4d8" // Water
    } else if (AverageHeight < 1) {
        CTX.fillStyle = "#0077b6" // Deep Water
    }
    
    const x1 = Delaunay.coords[2 * pt1];
    const y1 = Delaunay.coords[2 * pt1 + 1];
    const x2 = Delaunay.coords[2 * pt2];
    const y2 = Delaunay.coords[2 * pt2 + 1];
    const x3 = Delaunay.coords[2 * pt3];
    const y3 = Delaunay.coords[2 * pt3 + 1];
    
    CTX.beginPath();
    CTX.moveTo(x1, y1);
    CTX.lineTo(x2, y2);
    CTX.lineTo(x3, y3);
    CTX.closePath();
    CTX.fill();
}

function GenerateNoiseMap()
{
    let Scale = 50;
    
    let MaxPossibleHeight = 0;
    let Amplitude = 1;
    let Frequency = 1;
    let Persistance = 0.3;
    let Lacunarity = 0.2;
    
    let OctavesOffset = new Array(8);
    for (let i = 0; i < 8; i++)
    {
        let OffsetX = 235236237;
        let OffsetZ = 3426347;
        OctavesOffset[i] = [OffsetX, OffsetZ];

        MaxPossibleHeight += Amplitude;
        Amplitude *= Persistance;
    }

    let MaxNoiseHeight = Number.MIN_VALUE;
    let MinNoiseHeight = Number.MAX_VALUE;

    for (let J = 0; J < Vertices.length; J++)
    {
        Amplitude = 1;
        Frequency = 1;
        let NoiseHeight = 0;

        for(let I = 0; I < 8; I++)
        {
            let SampleX = (Vertices[J].x + OctavesOffset[I][0]) / Scale * Frequency;
            let SampleZ = (Vertices[J].z + OctavesOffset[I][1]) / Scale * Frequency;

            let PerlinValue = Perlin.perlin2(SampleX, SampleZ) * 2 - 1;
            NoiseHeight += PerlinValue * Amplitude;
            
            Amplitude *= Persistance;
            Frequency *= Lacunarity;
        }

        if (NoiseHeight > MaxNoiseHeight)
            MaxNoiseHeight = NoiseHeight;
        else if (NoiseHeight < MinNoiseHeight)
            MinNoiseHeight = NoiseHeight;

        NoiseMap[J] = NoiseHeight;
    }
}




