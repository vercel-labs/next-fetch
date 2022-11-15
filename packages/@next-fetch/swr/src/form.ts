import { type HTMLProps, createElement } from "react";
import { useForm as useForm_ } from "@next-fetch/core-plugin/form";
import type {
  SWRMutationResponse,
  SWRMutationConfiguration,
} from "swr/mutation";
import type { HookMetadata } from "@next-fetch/core-plugin/client";

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
  formProps: HTMLProps<HTMLFormElement> & {
    encType?: "application/x-www-form-urlencoded";
  };
} {
  return useForm_(hook, config);
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
    encType?: "application/x-www-form-urlencoded";
  }>) {
  const { formProps } = useForm(mutation, mutationConfig);
  return createElement("form", { ...formProps, ...props }, props.children);
}
