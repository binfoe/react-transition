# react transition

> simple react transition and transition-group library

## Install

```bash
pnpm install reactrans
```

## Usage

```tsx
import { Transition } from 'reactrans';

export const Demo: FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Transition destroyAfterLeave isEnter={open} enterTo="translate-x-0" leaveTo="translate-x-full">
        <div className="fixed w-30 h-full transition-all p-4">hello world</div>
      </Transition>
      <div>
        <button
          onClick={() => {
            setOpen(!open);
          }}
        >
          Toggle
        </button>
      </div>
    </div>
  );
};
```

## Properties

属性参数

- `isEnter` 当前展示状态。true 代表 enter 状态，false 代表 leave 状态。必要参数，用于控制 enter 和 leave 切换动画。
- `enterFrom` enter 开始时的初始 classname。可选参数，如果不指定会使用 `leaveTo` 参数。
- `enterActive`enter 开始时的激活 classname。可选参数，默认为空。
- `enterTo` enter 开始后的目标 classname。可选参数，如果不指定会使用 `leaveFrom` 参数。
- `enterDone` enter 动画结束后赋予的 classname。可选参数，如果不指定会使用 `enterTo` 参数。
- `leaveFrom` leave 开始时的初始 classname。可选参数，如果不指定会使用 `enterTo` 参数。
- `leaveActive`leave 开始时的激活 classname。可选参数，默认为空。
- `leaveTo` leave 开始后的目标 classname。可选参数，如果不指定会使用 `enterFrom` 参数。
- `leaveDone` leave 动画结束后赋予的 classname。可选参数，如果不指定会使用 `leaveTo` 参数。
- `destroyAfterLeave` 是否在 leave 动画后销毁 DOM。可选参数，默认 false。
- `appear` 是否在首次渲染且 isEnter 为 true 时使用动画。可选参数，默认 false，即首次直接展示不使用动画。

回调参数

- `onEnter`: (el) => void;
- `onBeforeEnter`: (el) => void;
- `onAfterEnter`: (el) => void;
- `onEnterCancelled`: (el) => void;
- `onLeave`: (el) => void;
- `onBeforeLeave`: (el) => void;
- `onAfterLeave`: (el) => void;
- `onLeaveCancelled`: (el) => void;
