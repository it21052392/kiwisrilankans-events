"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  AlertTriangle, 
  Trash2, 
  Save, 
  LogOut, 
  CheckCircle, 
  XCircle,
  Info,
  Shield
} from "lucide-react"

const confirmationVariants = cva(
  "flex items-center gap-3 p-4 rounded-lg border",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        destructive: "bg-destructive/10 border-destructive/20 text-destructive",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/30 dark:text-yellow-200",
        success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-200",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconVariants = cva(
  "flex-shrink-0",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        destructive: "text-destructive",
        warning: "text-yellow-600 dark:text-yellow-400",
        success: "text-green-600 dark:text-green-400",
        info: "text-blue-600 dark:text-blue-400",
      },
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface ConfirmationDialogProps {
  trigger?: React.ReactNode
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning" | "success" | "info"
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showIcon?: boolean
  icon?: React.ReactNode
  className?: string
}

const getDefaultIcon = (variant: string) => {
  switch (variant) {
    case "destructive":
      return <Trash2 className="h-5 w-5" />
    case "warning":
      return <AlertTriangle className="h-5 w-5" />
    case "success":
      return <CheckCircle className="h-5 w-5" />
    case "info":
      return <Info className="h-5 w-5" />
    default:
      return <Shield className="h-5 w-5" />
  }
}

const getDefaultTexts = (variant: string) => {
  switch (variant) {
    case "destructive":
      return {
        confirmText: "Delete",
        cancelText: "Cancel"
      }
    case "warning":
      return {
        confirmText: "Continue",
        cancelText: "Cancel"
      }
    case "success":
      return {
        confirmText: "Confirm",
        cancelText: "Cancel"
      }
    case "info":
      return {
        confirmText: "OK",
        cancelText: "Cancel"
      }
    default:
      return {
        confirmText: "Confirm",
        cancelText: "Cancel"
      }
  }
}

export function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
  disabled = false,
  open,
  onOpenChange,
  showIcon = true,
  icon,
  className,
}: ConfirmationDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isConfirming, setIsConfirming] = React.useState(false)

  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : isOpen
  const setDialogOpen = isControlled ? onOpenChange : setIsOpen

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      setDialogOpen?.(false)
    } catch (error) {
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    setDialogOpen?.(false)
  }

  const defaultTexts = getDefaultTexts(variant)
  const finalConfirmText = confirmText || defaultTexts.confirmText
  const finalCancelText = cancelText || defaultTexts.cancelText

  const displayIcon = showIcon ? (icon || getDefaultIcon(variant)) : null

  const content = (
    <AlertDialogContent className={cn("max-w-md", className)}>
      <AlertDialogHeader>
        <div className={cn(confirmationVariants({ variant }))}>
          {displayIcon && (
            <div className={cn(iconVariants({ variant }))}>
              {displayIcon}
            </div>
          )}
          <div className="flex-1">
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-left mt-1">
              {description}
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel 
          onClick={handleCancel}
          disabled={isLoading || isConfirming}
        >
          {finalCancelText}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          disabled={disabled || isLoading || isConfirming}
          className={cn(
            variant === "destructive" && "bg-destructive hover:bg-destructive/90",
            variant === "warning" && "bg-yellow-600 hover:bg-yellow-700 text-white",
            variant === "success" && "bg-green-600 hover:bg-green-700 text-white",
            variant === "info" && "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {isLoading || isConfirming ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </div>
          ) : (
            finalConfirmText
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )

  if (trigger) {
    return (
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
        {content}
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {content}
    </AlertDialog>
  )
}

// Hook for easy confirmation dialogs
export function useConfirmation() {
  const [dialog, setDialog] = React.useState<{
    title: string
    description: string
    variant?: "default" | "destructive" | "warning" | "success" | "info"
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
  } | null>(null)

  const confirm = React.useCallback((config: {
    title: string
    description: string
    variant?: "default" | "destructive" | "warning" | "success" | "info"
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
  }) => {
    setDialog(config)
  }, [])

  const clearDialog = React.useCallback(() => {
    setDialog(null)
  }, [])

  const ConfirmationDialogComponent = React.useMemo(() => {
    if (!dialog) return null

    return (
      <ConfirmationDialog
        open={!!dialog}
        onOpenChange={(open) => !open && clearDialog()}
        title={dialog.title}
        description={dialog.description}
        variant={dialog.variant}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    )
  }, [dialog, clearDialog])

  return {
    confirm,
    clearDialog,
    ConfirmationDialog: ConfirmationDialogComponent,
  }
}
