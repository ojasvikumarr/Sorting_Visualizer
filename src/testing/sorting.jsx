import React, { useEffect, useRef, useState } from "react";

export default function Sorting() {
    const canvasRef = useRef(null);
    const n = 20;
    // const array = Array.from({ length: n }, () => Math.random());
    const [array, setArray] = useState(() =>
        Array.from({ length: n }, () => Math.random())
    );
    useEffect(() => {
        const myCanvas = canvasRef.current;
        if (!myCanvas) return;

        const ctx = myCanvas.getContext("2d");
        myCanvas.width = 700;
        myCanvas.height = 400;
        const margin = 30;

        // Linear interpolation function
        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        // Column class for visualization
        class Column {
            constructor(x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.queue = [];
            }

            // Define movement of columns
            moveTo(loc, yOffset = 1, frameCount = 10) {
                for (let i = 1; i <= frameCount; i++) {
                    const t = i / frameCount;
                    const u = Math.sin(t * Math.PI);
                    this.queue.push({
                        x: lerp(this.x, loc.x, t),
                        y: lerp(this.y, loc.y, t) + u * this.width / 2 * yOffset,
                    });
                }
            }

            // Draw the column
            draw(ctx) {
                let changed = false;
                if (this.queue.length > 0) {
                    const { x, y } = this.queue.shift();
                    this.x = x;
                    this.y = y;
                    changed = true;
                }
                const left = this.x - this.width / 2;
                const top = this.y - this.height;
                const right = this.x + this.width / 2;

                ctx.beginPath();
                ctx.fillStyle = "gray";
                ctx.moveTo(left, top);
                ctx.ellipse(
                    this.x,
                    this.y,
                    this.width / 2,
                    this.width / 4,
                    0,
                    Math.PI,
                    Math.PI * 2,
                    true
                );
                ctx.lineTo(right, top);
                ctx.ellipse(
                    this.x,
                    top,
                    this.width / 2,
                    this.width / 4,
                    0,
                    0,
                    Math.PI * 2,
                    true
                );
                ctx.fill();
                ctx.stroke();

                return changed;
            }
        }

        // Bubble Sort Logic
        function bubbleSort(array) {
            let moves = [];
            do {
                var swapped = false;
                for (let i = 1; i < array.length; i++) {
                    if (array[i - 1] > array[i]) {
                        swapped = true;
                        [array[i - 1], array[i]] = [array[i], array[i - 1]];
                        moves.push({ indices: [i - 1, i], swap: true });
                    } else {
                        moves.push({ indices: [i - 1, i], swap: false });
                    }
                }
            } while (swapped);
            return moves;
        }

        const spacing = (myCanvas.width - margin * 2) / n;
        const cols = [];
        const maxColumnHeight = 300;

        // Initialize columns
        for (let i = 0; i < array.length; i++) {
            const x = spacing * i + spacing / 2 + margin;
            const y = myCanvas.height - margin - i*3;
            const width = spacing - 4;
            const height = array[i] * maxColumnHeight;
            cols[i] = new Column(x, y, width, height);
        }

        let moves = bubbleSort([...array]);

        // Animation Loop
        function animate() {
            ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
            let changed = false;

            for (let i = 0; i < cols.length; i++) {
                changed = cols[i].draw(ctx) || changed;
            }

            if (!changed && moves.length > 0) {
                const move = moves.shift();
                const [i, j] = move.indices;
                if (move.swap) {
                    cols[i].moveTo(cols[j]);
                    cols[j].moveTo(cols[i], -1);
                    [cols[i], cols[j]] = [cols[j], cols[i]];
                }
            }
            requestAnimationFrame(animate);
        }

        animate();
    }, [array]);

    return (
        <>
            <h1>Sorting Visualizer</h1>
            <canvas
                ref={canvasRef}
                style={{
                    border: "1px solid black",
                    margin: "10px",
                    paddingBottom: "20px",
                }}
            />
            <button onClick={() => setArray(Array.from({ length: n }, () => Math.random()))}>
                Reset Array
            </button>
        </>
    );
}