import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { useFormContext } from 'react-hook-form'

import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { renderInlineLinks } from '../inlineLinks'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const props = register(name, { required: required })
  const { setValue } = useFormContext()

  return (
    <Width width={width}>
      {/* items-start: uzun (çok satırlı) onay metinlerinde kutu ilk satırla hizalı kalır */}
      <div className="flex items-start gap-3">
        <CheckboxUi
          defaultChecked={defaultValue}
          id={name}
          className="mt-0.5"
          {...props}
          onCheckedChange={(checked) => {
            setValue(props.name, checked)
          }}
        />
        {/* Etiket blok akışında: içindeki bağlantılar metinle aynı satırda kalır */}
        <Label
          htmlFor={name}
          className="block text-sm leading-relaxed font-normal text-black/70 dark:text-white/70"
        >
          {required && (
            <span className="required">
              * <span className="sr-only">(required)</span>
            </span>
          )}
          {/* "[metin](adres)" kalıpları bağlantıya çevrilir (ör. Açık Rıza Beyanı) */}
          {renderInlineLinks(label)}
        </Label>
      </div>
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
