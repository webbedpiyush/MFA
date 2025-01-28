import { Suspense } from "react";
import ForgotPassword from "./_forgotpassword";

export default function page() {
  return (
    <Suspense>
      <ForgotPassword />
    </Suspense>
  );
}
