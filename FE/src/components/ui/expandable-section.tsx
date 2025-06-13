import React, { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { Button } from "./button";
import { Link } from "react-router-dom";

export interface ExpandableSectionItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
}

interface ExpandableSectionProps {
  items: ExpandableSectionItem[];
  className?: string;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  items,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const sectionItems = Array.from(
      containerRef.current.children
    ) as HTMLElement[];

    if (sectionItems.length === 0) return;

    const DURATION = 0.3;
    const EXPAND_FLEX_GROW = 2;
    const NORMAL_FLEX_GROW = 1;
    const SHRINK_FLEX_GROW = 0.5;

    sectionItems.forEach((item) => {
      const descriptionElement = item.querySelector(".feature-description");
      const buttonElement = item.querySelector(".feature-button");

      // Initially hide description and button
      if (descriptionElement && buttonElement) {
        gsap.set([descriptionElement, buttonElement], {
          opacity: 0,
          y: 20,
          display: "none",
        });
      }

      // Set initial state
      gsap.set(item, {
        flexGrow: NORMAL_FLEX_GROW,
        width: `${100 / sectionItems.length}%`,
      });

      item.addEventListener("mouseenter", () => {
        // Expand hovered item
        gsap.to(item, {
          flexGrow: EXPAND_FLEX_GROW,
          duration: DURATION,
          ease: "power2.inOut",
        });

        // Show description and button
        if (descriptionElement && buttonElement) {
          gsap.to([descriptionElement, buttonElement], {
            opacity: 1,
            y: 0,
            display: "block",
            duration: DURATION,
            stagger: 0.1,
            ease: "power2.out",
          });
        }

        // Shrink other items
        sectionItems.forEach((otherItem) => {
          if (otherItem !== item) {
            gsap.to(otherItem, {
              flexGrow: SHRINK_FLEX_GROW,
              duration: DURATION,
              ease: "power2.inOut",
            });
          }
        });
      });

      item.addEventListener("mouseleave", () => {
        // Reset hovered item
        gsap.to(item, {
          flexGrow: NORMAL_FLEX_GROW,
          duration: DURATION,
          ease: "power2.inOut",
        });

        // Hide description and button
        if (descriptionElement && buttonElement) {
          gsap.to([descriptionElement, buttonElement], {
            opacity: 0,
            y: 20,
            display: "none",
            duration: DURATION,
            ease: "power2.in",
          });
        }

        // Reset other items
        sectionItems.forEach((otherItem) => {
          if (otherItem !== item) {
            gsap.to(otherItem, {
              flexGrow: NORMAL_FLEX_GROW,
              duration: DURATION,
              ease: "power2.inOut",
            });
          }
        });
      });
    });

    return () => {
      sectionItems.forEach((item) => {
        item.removeEventListener("mouseenter", () => {});
        item.removeEventListener("mouseleave", () => {});
      });
    };
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-row gap-4 md:gap-6 h-[300px] w-full", className)}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="relative bg-gray-100 rounded-lg overflow-hidden flex-1 cursor-pointer"
        >
          <img
            src={item.imageUrl || "/images/feature-placeholder.png"}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="feature-content relative z-10 h-full flex flex-col justify-end p-6">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              {item.title}
            </h3>
            {item.description && (
              <p className="feature-description text-sm md:text-base text-white/90 mb-4">
                {item.description}
              </p>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="feature-button self-start bg-white text-black hover:bg-white/80 content-center"
              asChild
            >
              <Link to={item.link || "#"}> Xem ngay </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
