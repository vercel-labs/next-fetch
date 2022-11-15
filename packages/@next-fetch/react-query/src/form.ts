import { type HTMLProps, createElement } from "react";
import { useForm as useForm_ } from "@next-fetch/core-plugin/form";
import type {
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import type { HookMetadata } from "@next-fetch/core-plugin/client";

type HookWithFormSubmission<Data, Error, Input, Context> = Pick<
  UseMutationResult<Data, Error, Input, Context>,
  "mutate"
> & {
  meta: HookMetadata;
};

/**
 * A React hook to create a form that can be submitted to a mutation.
 * This enables progressive enhancement, as the form can be submitted
 * without having to re-render the app using JavaScript code.
 */
export function useForm<Data, Error, Input, Context>(
  hook: HookWithFormSubmission<Data, Error, Input, Context>,
  config?: UseMutationOptions<Data, Error, Input, Context>
): {
  formProps: HTMLProps<HTMLFormElement> & {
    encType?: "application/x-www-form-urlencoded";
  };
} {
  return useForm_({ meta: hook.meta, trigger: hook.mutate }, config);
}

/**
 * A mutation-aware form component.
 * This enables progressive enhancement, as the form can be submitted
 * without having to re-render the app using JavaScript code.
 */
export function Form<Data, Error, Input, Context>({
  mutation,
  mutationConfig,
  ...props
}: React.HTMLProps<HTMLFormElement> &
  React.PropsWithChildren<{
    mutation: HookWithFormSubmission<Data, Error, Input, Context>;
    mutationConfig?: UseMutationOptions<Data, Error, Input, Context>;
    encType?: "application/x-www-form-urlencoded";
  }>) {
  const { formProps } = useForm(mutation, mutationConfig);
  return createElement("form", { ...formProps, ...props }, props.children);
}
