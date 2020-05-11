import { Converter } from '../converter';
import { RequiredConverter } from '../required';

export abstract class ObjectConverter<Result extends object> extends RequiredConverter<
  Result,
  unknown
> {
  public abstract readonly converters: { [K in keyof Result]-?: Converter<Result[K], unknown> };

  public abstract get partial(): ObjectConverter<Partial<Result>>;
}
