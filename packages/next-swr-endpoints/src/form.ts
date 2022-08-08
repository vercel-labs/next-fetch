import { HTMLProps, useCallback, useEffect, useMemo, useRef } from "react";
import type {
  SWRMutationResponse,
  SWRMutationConfiguration,
} from "swr/mutation";
import type { HookMetadata } from "./client";
import { createElement } from "react";

type HookWithFormSubmission<Data, Error> = Pick<
  SWRMutationResponse<Data, Error>,
  "trigger"
> & {
  meta: HookMetadata;
};

/**
 * A React hook to create a form that can be submitted to a mutation.
 * This enables progressive enhancement, as the form can be submitted
 * without having to re-render the app using JavaScript code.
 */
export function useForm<Data, Error>(
  hook: HookWithFormSubmission<Data, Error>,
  config?: SWRMutationConfiguration<Data, Error>
): {
  formProps: HTMLProps<HTMLFormElement>;
} {
  const { trigger, meta } = hook;

  return {
    formProps: {
      method: meta.method,
      action: `${meta.baseUrl}?__handler=${meta.handlerName}`,
      onSubmit: useEvent((event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        trigger(data, config);
      }),
    },
  };
}

/**
 * A mutation-aware form component.
 * This enables progressive enhancement, as the form can be submitted
 * without having to re-render the app using JavaScript code.
 */
export function Form<Data, Error>({
  mutation,
  mutationConfig,
  ...props
}: React.HTMLProps<HTMLFormElement> &
  React.PropsWithChildren<{
    mutation: HookWithFormSubmission<Data, Error>;
    mutationConfig?: SWRMutationConfiguration<Data, Error>;
  }>) {
  const { formProps } = useForm(mutation, mutationConfig);
  return createElement("form", { ...formProps, ...props }, props.children);
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
