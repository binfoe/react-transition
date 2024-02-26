import type { FC, Key, ReactElement, ReactNode } from 'react';
import { cloneElement, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Transition, TransitionProps } from './transition';

interface Item {
  isEnter: boolean;
  key: Key;
  node: ReactElement<TransitionProps, typeof Transition>;
}

function k(children: Item['node'][], onLeave: (key: Key) => void, appear = false) {
  return children.map((node) => {
    const key = node.key;
    if (!key) throw new Error('child of <TransitionGroup> must has "key"');
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
    } as Item;
  });
}

export const TransitionGroup: FC<{
  children: ReactNode;
  appear?: boolean;
}> = ({ children, appear }) => {
  const initList = useMemo<Item[]>(() => (appear ? [] : k(children as unknown as Item['node'][], onLeave, false)), []);
  const refList = useRef(initList);
  const [renderList, setRenderList] = useState<Item[]>(initList);

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
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      if (!appear) {
        return;
      }
    }
    const newItems = k(children as unknown as Item['node'][], onLeave, true);
    const newKeys = new Map();
    newItems.forEach((it, i) => newKeys.set(it.key.toString(), i));
    // console.log('CCC', newKeys, children.length, refList);
    const oldKeys = new Set();
    refList.current.forEach((old) => {
      oldKeys.add(old.key);
      const newIdx = newKeys.get(old.key);
      if (newIdx === undefined) {
        if (old.isEnter) {
          old.isEnter = false;
          old.node = cloneElement(old.node, { isEnter: false }) as Item['node'];
          // console.log('REMOVE', old.node);
        }
      } else {
        old.isEnter = true;
        old.node = cloneElement(newItems[newIdx].node, { isEnter: true }) as Item['node'];
        // console.log('Keep', old);
      }
    });
    newItems.forEach((item) => {
      if (!oldKeys.has(item.key)) {
        refList.current.push(item);
        // console.log('ADD', item);
      }
    });
    setRenderList(refList.current.slice());
  }, [children]);

  return renderList.map((item) => item.node);
};
