"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: false,
    theme: "default",
});

export default function MermaidDiagram({
    chart,
}: {
    chart: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const render = async () => {
            if (!ref.current) return;

            try {
                const id = "graph" + Date.now();


                console.log(JSON.stringify(chart));

                const { svg } = await mermaid.render(id, chart);

                ref.current.innerHTML = svg;
            } catch (error) {
                console.error("Mermaid rendering error:", error);

                ref.current.innerHTML = `
          <div style="color: red; padding: 10px;">
            Unable to render diagram.
          </div>
        `;
            }
        };

        render();
    }, [chart]);

    return <div ref={ref} />;
}