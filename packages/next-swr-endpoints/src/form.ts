import type { HTMLProps } from "react";
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
      onSubmit(event) {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        trigger(data, config);
      },
    },
  };
}

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
