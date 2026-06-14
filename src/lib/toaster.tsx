import { toast } from "react-toastify";

type ToastType = "info" | "success" | "warning" | "error";

function ToasterBody({ header, message }: { header: string; message: string }) {
  return (
    <div className="ml-2 flex flex-col gap-1 text-black">
      <h1 className="text-base font-bold">{header}</h1>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function toastMessage({
  header,
  message,
  toastType,
}: {
  header: string;
  message: string;
  toastType: ToastType;
}) {
  const fn = {
    info: toast.info,
    success: toast.success,
    warning: toast.warning,
    error: toast.error,
  }[toastType];

  fn?.(<ToasterBody header={header} message={message} />, {
    closeButton: false,
    ariaLabel: header,
  });
}
