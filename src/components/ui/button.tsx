import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white rounded-sm hover:bg-primary-hover active:bg-primary-hover',
        destructive:
          'bg-destructive text-white rounded-sm hover:bg-destructive',
        outline:
          'border border-border bg-white text-foreground rounded-sm hover:bg-secondary',
        secondary:
          'bg-secondary text-foreground rounded-sm hover:bg-muted',
        ghost:
          'rounded-sm hover:bg-secondary text-foreground',
        link:
          'text-primary underline-offset-2 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-8 px-4',
        sm: 'h-7 px-3 text-[12px]',
        lg: 'h-9 px-5',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
