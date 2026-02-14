import * as React from "react"
import { Button, type ButtonProps } from "./button"

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

/**
 * ローディング状態を表示できるボタンコンポーネント
 */
export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(({ children, loading, disabled, ...props }, ref) => {
  return (
    <Button ref={ref} disabled={disabled || loading} {...props}>
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Button>
  )
})

LoadingButton.displayName = "LoadingButton"
