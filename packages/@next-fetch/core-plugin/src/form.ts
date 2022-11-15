import { type HTMLProps, useEffect, useMemo, useRef } from "react";
import type { HookMetadata } from "./client";

type HookWithFormSubmission<Input, Config> = {
  meta: HookMetadata;
  trigger: (input: Input, config?: Config) => unknown;
};

/**
 * A React hook to create a form that can be submitted to a mutation.
 * This enables progressive enhancement, as the form can be submitted
 * without having to re-render the app using JavaScript code.
 */
export function useForm<Input, Config>(
  hook: HookWithFormSubmission<Input, Config>,
  config?: Config
): {
  formProps: HTMLProps<HTMLFormElement> & {
    encType?: "application/x-www-form-urlencoded";
  };
} {
  const { trigger, meta } = hook;

  return {
    formProps: {
      method: meta.method,
      action: `${meta.baseUrl}?__handler=${meta.handlerName}`,
      onSubmit: useEvent((event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        trigger(data as any, config);
      }),
    },
  };
}

function useEvent<Inputs extends any[], Output>(
  fn: (...inputs: Inputs) => Output
): (...inputs: Inputs) => Output {
  const ref = useRef<(...inputs: Inputs) => Output>();
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useMemo(
    () =>
      (...inputs: Inputs) => {
        if (!ref.current) {
          throw new Error("invalid state");
        }
        return ref.current(...inputs);
      },
    []
  );
}
