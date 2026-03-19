import React from 'react';

const MOTION_ONLY_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'whileInView',
  'whileHover',
  'whileTap',
  'viewport',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
]);

const componentCache = new Map();

function createMotionComponent(tag) {
  const MotionLikeComponent = React.forwardRef(function MotionLikeComponent(
    { children, ...props },
    ref
  ) {
    const domProps = {};

    for (const [key, value] of Object.entries(props)) {
      if (!MOTION_ONLY_PROPS.has(key)) {
        domProps[key] = value;
      }
    }

    return React.createElement(tag, { ...domProps, ref }, children);
  });

  MotionLikeComponent.displayName = `MotionLite(${String(tag)})`;
  return MotionLikeComponent;
}

export const motion = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!componentCache.has(prop)) {
        componentCache.set(prop, createMotionComponent(prop));
      }
      return componentCache.get(prop);
    },
  }
);

export function AnimatePresence({ children }) {
  return <>{children}</>;
}
