import { Suspense } from "react";
import ConfirmAccount from "./_confirmpassword";

export default function page() {
  return (
    <Suspense>
      <ConfirmAccount />
    </Suspense>
  );
}
