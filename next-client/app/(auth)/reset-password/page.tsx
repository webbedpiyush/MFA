import { Suspense } from "react";
import ResetPassword from "./_resetpassword";

export default function page() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
