import type { FC, Key, ReactElement, ReactNode } from 'react';
import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';

interface Item {
  isEnter: boolean;
  key: Key;
  node: ReactElement;
}
type TransitionGroupElement = Omit<ReactElement, 'key'> & { key: string };

const W: FC<{ children: ReactNode }> = ({ children }) => {
  return children;
};
function k(children: TransitionGroupElement[], onLeave: (key: Key) => void, appear = false) {
  return children.map((node) => {
    const key = node.key;
    const item = cloneElement(node, {
      key,
      isEnter: true,
      appear,
      onAfterLeave() {
        onLeave(key as Key);
      },
    });
    return {
      key,
      node: item,
      isEnter: true,
    };
  });
}
export const TransitionGroup: FC<{
  children: TransitionGroupElement[];
}> = ({ children }) => {
  const memoList = useMemo<Item[]>(() => k(children, onLeave), []);
  const refList = useRef(memoList);
  const [renderList, setRenderList] = useState<Item[]>(memoList);

  function onLeave(key: Key) {
    // console.log('AFTER LEAVE', key);
    const idx = refList.current.findIndex((item) => item.key === key);
    if (idx >= 0) {
      refList.current.splice(idx, 1);
      setRenderList(refList.current.slice());
    } else {
      // eslint-disable-next-line no-console
      console.warn('something strange wrong');
    }
  }

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const newItems = k(children, onLeave, true);
    const newKeys = Object.fromEntries(newItems.map((it, i) => [it.key.toString(), i]));
    // console.log('CCC', newKeys, children.length, refList);
    const oldKeys = new Set();
    refList.current.forEach((old) => {
      oldKeys.add(old.key);
      const newIdx = newKeys[old.key.toString()];
      if (newIdx === undefined) {
        if (old.isEnter) {
          old.isEnter = false;
          old.node = cloneElement(old.node, { isEnter: false });
          // console.log('REMOVE', old.node);
        }
      } else {
        old.isEnter = true;
        old.node = cloneElement(newItems[newIdx].node, { isEnter: true });
      }
    });
    newItems.forEach((item) => {
      if (!oldKeys.has(item.key)) {
        refList.current.push(item);
      }
    });
    setRenderList(refList.current.slice());
  }, [children]);

  return (
    <>
      {renderList.map((item) => (
        <W key={item.key}>{item.node}</W>
      ))}
    </>
  );
};
