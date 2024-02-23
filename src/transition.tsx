import type { FC, ReactElement } from 'react';
import { cloneElement, forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface TransitionCallbacks {
  onAfterEnter?(el: HTMLElement): void;
  onEnterCancelled?(): void;
  onAfterLeave?(el: HTMLElement): void;
  onLeaveCancelled?(): void;
}

type Props = {
  children: ReactElement;
  destroyAfterLeave?: boolean;
  isEnter?: boolean;
  enter?: string;
  leave?: string;
  enterActive?: string;
  leaveActive?: string;
};

const TransitionInner: FC<
  Props & {
    onAfterEnter(el: HTMLElement): void;
    onAfterLeave(el: HTMLElement): void;
    onMounted(el: Element): void;
  }
> = ({ children, isEnter, onMounted, ...props }) => {
  const ref = useRef<HTMLElement>(null);
  const stepRef = useRef(0);
  const originalClass = useMemo(() => children.props.className ?? '', []);

  const getcls = () => `${originalClass} ${isEnter ? props.enter ?? '' : props.leave ?? ''}`;

  const [className, setClassName] = useState(() => getcls());

  const toggle = () => {
    // console.log('TOGGLE TRANSITION', realEnter);
    const el = ref?.current;
    if (!el) return;

    stepRef.current = isEnter ? 10 : 20;
    setClassName(originalClass);
  };

  useEffect(() => {
    const step = stepRef.current;
    if (step === 10 || step === 20) {
      const acls = step === 10 ? props.enterActive : props.leaveActive;
      stepRef.current += 1;
      setClassName(`${getcls()} ${acls ?? ''}`);
    }
  }, [className]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    toggle();
  }, [isEnter]);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const onEnd = () => {
      if (!ref.current) return;
      if (stepRef.current === 21) {
        props.onAfterLeave?.(ref.current);
      } else if (stepRef.current === 11) {
        props.onAfterEnter?.(ref.current);
      }
    };
    ref.current.addEventListener('transitionend', onEnd);
    onMounted(ref.current);
    return () => {
      ref.current?.removeEventListener('transitionend', onEnd);
    };
  }, []);
  return cloneElement(children, {
    className,
    ref,
  });
};

type TransitionProps = Props & TransitionCallbacks;

export const Transition = forwardRef<Element, TransitionProps>(
  (
    {
      destroyAfterLeave = false,
      onAfterLeave,
      onAfterEnter,
      onEnterCancelled,
      onLeaveCancelled,
      isEnter,
      ...restProps
    },
    ref,
  ) => {
    const [mounted, setMounted] = useState(!destroyAfterLeave || isEnter);
    const [realEnter, setRealEnter] = useState(isEnter);
    const state = useRef(isEnter ? 12 : 22); //

    useEffect(() => {
      if (!destroyAfterLeave) {
        setRealEnter(isEnter);
      } else {
        if (isEnter) {
          if (state.current === 21) {
            onLeaveCancelled?.();
            state.current = 11; // entering
            setRealEnter(true);
          } else {
            setMounted(true);
          }
        } else {
          if (state.current === 11 || state.current === 12) {
            if (state.current === 11) {
              onEnterCancelled?.();
            }
            state.current = 21; // leaving
            setRealEnter(false);
          }
        }
      }
    }, [isEnter]);

    return mounted ? (
      <TransitionInner
        isEnter={realEnter}
        onAfterLeave={(el) => {
          state.current = 22; // leaved
          onAfterLeave?.(el);
          // console.log('AFTER LEAVE');
          if (destroyAfterLeave) {
            setMounted(false);
          }
        }}
        onAfterEnter={(el) => {
          state.current = 12; //entered
          onAfterEnter?.(el);
        }}
        {...restProps}
        onMounted={(el) => {
          if (isEnter) {
            state.current = 11; // entering
            setRealEnter(true);
          }
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
        }}
      />
    ) : null;
  },
);
