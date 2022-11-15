import { type HTMLProps, createElement, forwardRef } from "react";
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
  formProps: HTMLProps<HTMLFormElement>;
} {
  return useForm_(hook, config);
}

/**
 * A mutation-aware form component.
 * This enables progressive enhancement, as the form can be submitted
 * without having to re-render the app using JavaScript code.
 */

// 4. https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref/58473012#58473012
declare module "react" {
  function forwardRef<T, P = {}>(
    render: (props: P, ref: React.ForwardedRef<T>) => React.ReactElement | null
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

type FormProps<Data, Error> = React.HTMLProps<HTMLFormElement> &
  React.PropsWithChildren<{
    mutation: HookWithFormSubmission<Data, Error>;
    mutationConfig?: SWRMutationConfiguration<Data, Error>;
  }>;

function FormImpl<Data, Error>(
  { mutation, mutationConfig, ...props }: FormProps<Data, Error>,
  ref?: React.ForwardedRef<HTMLFormElement>
) {
  const { formProps } = useForm(mutation, mutationConfig);

  return createElement("form", { ...formProps, ...props, ref }, props.children);
}

export const Form = forwardRef(FormImpl)