import type { HTMLProps } from "react";
import type { SWRMutationResponse } from "swr/mutation";
import type { HookMetadata } from "./client";
type HookWithFormSubmission = Pick<SWRMutationResponse, "trigger"> & {
  meta: HookMetadata;
};

export function useForm(hook: HookWithFormSubmission): {
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
        trigger(data);
      },
    },
  };
}
