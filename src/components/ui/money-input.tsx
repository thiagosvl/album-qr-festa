import * as React from "react";
import { Input } from "@/components/ui/input";
import { moneyMask, moneyToNumber } from "@/lib/masks";
import { cn } from "@/lib/utils";

export interface MoneyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: number | string | null | undefined;
  onChange: (valueInReais: number) => void;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, className, placeholder = "R$ 0,00", ...props }, ref) => {
    const formattedValue = React.useMemo(() => {
      if (value === undefined || value === null || value === "") {
        return "";
      }
      const numeric =
        typeof value === "number" ? value : Number(String(value).replace(",", "."));
      if (Number.isNaN(numeric)) {
        return "";
      }
      return moneyMask(numeric);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericReais = moneyToNumber(e.target.value);
      onChange(numericReais);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={formattedValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn("font-semibold tabular-nums", className)}
        {...props}
      />
    );
  }
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
