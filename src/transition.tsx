import type { FC, ReactElement } from 'react';
import { cloneElement, forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface TransitionCallbacks {
  onAfterEnter?(el: HTMLElement): void;
  onEnterCancelled?(): void;
  onAfterLeave?(el: HTMLElement): void;
  onLeaveCancelled?(): void;
}

export type TransitionInnerProps = {
  children: ReactElement;
  destroyAfterLeave?: boolean;
  isEnter?: boolean;
  enter?: string;
  leave?: string;
  enterActive?: string;
  leaveActive?: string;
  appear?: boolean;
};

const TransitionInner: FC<
  TransitionInnerProps & {
    onAfterEnter(el: HTMLElement): void;
    onAfterLeave(el: HTMLElement): void;
    onMounted(el: Element): void;
  }
> = ({ children, isEnter, onMounted, ...props }) => {
  const ref = useRef<HTMLElement>(null);
  /**
   * next step, 0b00: enter, 0b10: leave，0b01: after enter, 0b11: after leave
   */
  const stepRef = useRef(0b00);
  const originalClass = useMemo(() => children.props.className ?? '', []);

  const getcls = () => `${originalClass} ${isEnter ? props.enter ?? '' : props.leave ?? ''}`;

  const [className, setClassName] = useState(() => getcls());

  const toggle = () => {
    // console.log('TOGGLE TRANSITION', realEnter);
    const el = ref?.current;
    if (!el) return;

    stepRef.current = isEnter ? 0b00 : 0b10;
    setClassName(originalClass);
  };

  useEffect(() => {
    const step = stepRef.current;
    if (step === 0b00 || step === 0b10) {
      const acls = step === 0b00 ? props.enterActive : props.leaveActive;
      stepRef.current |= 0b01;
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
      if (stepRef.current === 0b11) {
        props.onAfterLeave?.(ref.current);
      } else if (stepRef.current === 0b01) {
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

export type TransitionProps = TransitionInnerProps & TransitionCallbacks;

enum TState {
  Entering,
  Entered,
  Leaving,
  Leaved,
}
export const Transition = forwardRef<Element, TransitionProps>(
  (
    {
      destroyAfterLeave,
      appear,
      onAfterLeave,
      onAfterEnter,
      onEnterCancelled,
      onLeaveCancelled,
      isEnter,
      ...restProps
    },
    ref,
  ) => {
    const [mounted, setMounted] = useState(!destroyAfterLeave || (appear ? !isEnter : isEnter));
    const [realEnter, setRealEnter] = useState(appear ? !isEnter : isEnter);
    const state = useRef((appear ? !isEnter : isEnter) ? TState.Entered : TState.Leaved);

    useEffect(() => {
      if (!destroyAfterLeave) {
        setRealEnter(isEnter);
      } else {
        if (isEnter) {
          if (state.current === TState.Leaving) {
            onLeaveCancelled?.();
            state.current = TState.Entering;
            setRealEnter(true);
          } else {
            setMounted(true);
          }
        } else {
          if (state.current === TState.Entering || state.current === TState.Entered) {
            if (state.current === TState.Entering) {
              onEnterCancelled?.();
            }
            state.current = TState.Leaving;
            setRealEnter(false);
          }
        }
      }
    }, [isEnter]);

    return mounted ? (
      <TransitionInner
        isEnter={realEnter}
        onAfterLeave={(el) => {
          state.current = TState.Leaved;
          onAfterLeave?.(el);
          // console.log('AFTER LEAVE');
          if (destroyAfterLeave) {
            setMounted(false);
          }
        }}
        onAfterEnter={(el) => {
          state.current = TState.Entered;
          onAfterEnter?.(el);
        }}
        {...restProps}
        onMounted={(el) => {
          if (isEnter) {
            state.current = TState.Entering;
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
