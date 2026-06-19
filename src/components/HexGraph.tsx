import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { UserStats } from '../types';

interface HexGraphProps {
  stats?: UserStats;
  customLabels?: string[];
  customData?: number[];
  size?: number;
  title?: string;
  decayingIndices?: number[];
}

const HexGraph: React.FC<HexGraphProps> = ({ stats, customLabels, customData, size = 300, title, decayingIndices }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = size;
    const height = size;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const labels = customLabels || ["Strength", "Intelligence", "Agility", "Vitality", "Willpower", "Social"];
    const data = customData || (stats ? [
      stats.strength, stats.intelligence, stats.agility,
      stats.vitality, stats.willpower, stats.social
    ] : [10, 10, 10, 10, 10, 10]);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const angleSlice = (Math.PI * 2) / labels.length;

    const levels = Math.min(5, labels.length);
    for (let j = 0; j < levels; j++) {
      const r = (radius / levels) * (j + 1);
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 255, 255, 0.1)")
        .attr("stroke-dasharray", "4,4");
    }

    const axis = g.selectAll(".axis")
      .data(labels)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (_d: string, i: number) => radius * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (_d: string, i: number) => radius * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("stroke", "rgba(255, 255, 255, 0.2)");

    axis.append("text")
      .attr("x", (_d: string, i: number) => (radius + 15) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (_d: string, i: number) => (radius + 15) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "rgba(255, 255, 255, 0.6)")
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .text((d: unknown) => (d as string).toUpperCase());

    if (decayingIndices && !customLabels) {
      decayingIndices.forEach(idx => {
        const angle = angleSlice * idx - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        g.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 8)
          .attr("fill", "none")
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2)
          .attr("opacity", 0.7)
          .append("animate")
          .attr("attributeName", "r")
          .attr("values", "6;10;6")
          .attr("dur", "2s")
          .attr("repeatCount", "indefinite");
        g.append("line")
          .attr("x1", x - 4).attr("y1", y - 4)
          .attr("x2", x + 4).attr("y2", y + 4)
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2);
        g.append("line")
          .attr("x1", x + 4).attr("y1", y - 4)
          .attr("x2", x - 4).attr("y2", y + 4)
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2);
      });
    }

    const line = d3.lineRadial<number>()
      .radius(d => (d / 100) * radius)
      .angle((_d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    const defs = svg.append("defs");

    const filter = defs.append("filter").attr("id", `glow-${title || 'main'}`);
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const path = g.append("path")
      .datum(data.map(() => 0))
      .attr("d", line)
      .attr("fill", "rgba(16, 185, 129, 0.85)")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("filter", `url(#glow-${title || 'main'})`);

    path.datum(data)
      .transition()
      .duration(1200)
      .ease(d3.easeElasticOut as any)
      .attrTween("d", function (d: number[]) {
        const interpolate = d3.interpolate(data.map(() => 0), d);
        const l = d3.lineRadial<number>()
          .radius((v: number) => (v / 100) * radius)
          .angle((_v: number, i: number) => i * angleSlice)
          .curve(d3.curveLinearClosed);
        return (t: number) => l(interpolate(t)) || '';
      });

    setTimeout(() => {
      g.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d: number, i: number) => (d / 100) * radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d: number, i: number) => (d / 100) * radius * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("r", 0)
        .transition()
        .duration(400)
        .delay((_d: number, i: number) => i * 100)
        .attr("r", 3)
        .attr("fill", "#00FF80");
    }, 1200);

  }, [stats, customLabels, customData, size, title, decayingIndices]);

  if (customLabels && customLabels.length < 3) return null;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm">
      {title && (
        <span className="text-[9px] font-display uppercase tracking-[0.25em] text-white/50 mb-2">{title}</span>
      )}
      <svg ref={svgRef} width={size} height={size}></svg>
    </div>
  );
};

export default HexGraph;
