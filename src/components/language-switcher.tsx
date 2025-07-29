'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Languages } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation(['common', 'settings']);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setSelectedLanguage(languageCode);
      setOpen(false);
      toast({
        title: t('settings:language_changed'),
        description: languages.find(lang => lang.code === languageCode)?.nativeName,
      });
    } catch (error) {
      toast({
        title: t('common:error'),
        description: t('settings:error_saving'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('settings:change_language')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('settings:change_language')}</DialogTitle>
          <DialogDescription>
            {t('settings:select_language')}
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          value={selectedLanguage}
          onValueChange={handleLanguageChange}
          className="gap-4 pt-4"
        >
          {languages.map((language) => (
            <div key={language.code} className="flex items-center space-x-2">
              <RadioGroupItem value={language.code} id={language.code} />
              <Label
                htmlFor={language.code}
                className="flex-1 cursor-pointer font-normal"
              >
                <div className="flex items-center justify-between">
                  <span>{language.nativeName}</span>
                  <span className="text-sm text-muted-foreground">
                    {language.name}
                  </span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}