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
    <div className="overflow-hidden w-[100vw] h-[100vh] fixed">
      <Transition destroyAfterLeave isEnter={open} enter="translate-x-0" leave="translate-x-full">
        <div className="fixed top-0 right-0 w-30 h-full transition-all p-4">hello world</div>
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
- `enter` enter 状态的 classname。
- `leave` leave 状态的 classname。
- `enterActive`enter 开始时的激活 classname，用于控制 enter 和 leave 使用不同动画。可选参数，默认为空。
- `leaveActive`leave 开始时的激活 classname，用于控制 enter 和 leave 使用不同动画。可选参数，默认为空。
- `destroyAfterLeave` 是否在 leave 动画后销毁 DOM。可选参数，默认 false。

回调参数

- `onAfterEnter`: (el) => void;
- `onEnterCancelled`: (el) => void;
- `onAfterLeave`: (el) => void;
- `onLeaveCancelled`: (el) => void;
