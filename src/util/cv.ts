import { cn } from './cn'

type VariantDefinitions = Record<string, Record<string, string | string[]>>

type VariantProps<V extends VariantDefinitions> = {
  [K in keyof V]?: keyof V[K] extends string ? keyof V[K] : never
} & {
  className?: string
}

type VariantConfig<V extends VariantDefinitions> = {
  base?: string | string[]
  variants?: V
  defaultVariants?: { [K in keyof V]?: keyof V[K] }
}

export function cv<V extends VariantDefinitions>(config: VariantConfig<V>) {
  return (props: VariantProps<V> = {}): string => {
    const { className, ...selected } = props
    const classes: string[] = []

    if (config.base) {
      classes.push(...(Array.isArray(config.base) ? config.base : [config.base]))
    }

    const variants = config.variants ?? ({} as V)
    const defaultVariants = config.defaultVariants ?? ({} as { [K in keyof V]?: keyof V[K] })

    for (const variantName in variants) {
      if (!Object.prototype.hasOwnProperty.call(variants, variantName)) {
        continue
      }

      const typedVariantName = variantName as keyof V
      const selectedValue = selected[typedVariantName] as string | undefined
      const fallbackValue = defaultVariants[typedVariantName] as string | undefined
      const variantValue = selectedValue ?? fallbackValue
      const variantClasses = variantValue ? variants[typedVariantName]?.[variantValue] : undefined

      if (variantClasses) {
        classes.push(...(Array.isArray(variantClasses) ? variantClasses : [variantClasses]))
      }
    }

    return cn(classes, className)
  }
}
