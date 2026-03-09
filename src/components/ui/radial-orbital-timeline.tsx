import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  centerContent?: React.ReactNode;
}

export default function RadialOrbitalTimeline({
  timelineData,
  centerContent,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => {
        if (parseInt(key) !== id) newState[parseInt(key)] = false;
      });
      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const relatedItems = getRelatedItems(id);
        const newPulse: Record<number, boolean> = {};
        relatedItems.forEach((relId) => (newPulse[relId] = true));
        setPulseEffect(newPulse);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (autoRotate) {
      timer = setInterval(() => {
        setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
      }, 50);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 180;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      onClick={handleContainerClick}
    >
      <div ref={orbitRef} className="relative" style={{ width: 420, height: 420 }}>
        {/* Orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-[360px] h-[360px] rounded-full border border-primary-foreground/10" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-primary-foreground/5" />
          <div className="absolute w-[240px] h-[240px] rounded-full border border-primary-foreground/5 border-dashed" />
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          {centerContent}
        </div>

        {/* Nodes */}
        <div className="absolute inset-0 flex items-center justify-center">
          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
              >
                {/* Pulse ring */}
                {(isPulsing || isRelated) && (
                  <div className="absolute -inset-3 rounded-full border-2 border-primary-foreground/40 animate-ping" />
                )}

                {/* Node circle */}
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 backdrop-blur-sm
                    transition-all duration-300 shadow-lg
                    ${isExpanded
                      ? "scale-125 bg-primary-foreground/25 border-primary-foreground/60 shadow-primary-foreground/30"
                      : isRelated
                        ? "scale-110 bg-primary-foreground/20 border-primary-foreground/50"
                        : "bg-primary-foreground/10 border-primary-foreground/25 hover:bg-primary-foreground/20 hover:border-primary-foreground/40"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>

                {/* Label */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-primary-foreground/80">
                  {item.title}
                </div>

                {/* Expanded card */}
                {isExpanded && (
                  <Card className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl z-50">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={item.status === "completed" ? "default" : item.status === "in-progress" ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{item.date}</span>
                      </div>
                      <CardTitle className="text-sm mt-1">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>Energy</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">{item.energy}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${item.energy}%` }}
                        />
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                            <Link className="h-3 w-3" />
                            <span>Connected</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button
                                  key={relatedId}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[10px] px-2"
                                  onClick={(e) => { e.stopPropagation(); toggleItem(relatedId); }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
