import { Converter } from '../converter';
import { RequiredConverter } from '../required';

export abstract class ContainerConverter<Result extends object, Input> extends RequiredConverter<
  Result,
  Input
> {
  public abstract readonly element: Converter<Result[keyof Result], unknown>;
}
